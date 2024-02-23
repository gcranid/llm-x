import { useEffect, useRef, useState, PropsWithChildren, MouseEvent } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import ScrollableFeed from 'react-scrollable-feed'

import { chatStore } from '../models/ChatStore'
import { settingStore } from '../models/SettingStore'
import { toastStore } from '../models/ToastStore'

import { IncomingMessage, Message } from './Message'
import { OllmaApi } from '../utils/OllamaApi'
import Paperclip from '../icons/Paperclip'
import base64EncodeImage from '../utils/base64EncodeImage'

const ChatBoxInputRow = observer(
  ({
    onSend,
    children,
  }: PropsWithChildren<{ onSend: (message: string, image?: string) => void }>) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [previewImage, setPreviewImage] = useState<string | undefined>(undefined)

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!inputRef.current) return

      const userMessage = inputRef.current.value || ''

      onSend(userMessage, previewImage)

      inputRef.current.value = ''
      inputRef.current.focus()

      setPreviewImage(undefined)
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileObj = event.target.files?.[0]
      if (!fileObj) {
        return
      }

      // reset file input
      event.target.value = ''

      try {
        const imageData = await base64EncodeImage(fileObj)

        setPreviewImage(imageData)
      } catch (e) {
        toastStore.addToast('Unable to read image', 'error')
      }
    }

    const noServer = !settingStore.selectedModel
    const inputDisabled = chatStore.isGettingData || noServer

    return (
      <div className={'mt-2 w-full ' + (noServer && 'tooltip')} data-tip="Server is not connected">
        <form className="flex min-h-fit w-full flex-row gap-2" onSubmit={onFormSubmit}>
          <div className="join relative w-full flex-1">
            <input
              className="input join-item input-bordered grow focus:outline-none"
              placeholder="Enter Prompt"
              ref={inputRef}
              type="text"
              disabled={inputDisabled}
            />

            {/* hidden file input */}
            <input
              style={{ display: 'none' }}
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
            />

            <button
              className={
                'btn join-item !rounded-r-md border ' +
                (inputDisabled ? '' : 'input-bordered hover:input-bordered')
              }
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={inputDisabled}
            >
              <Paperclip />
            </button>

            {previewImage && (
              <div className="--top-full absolute bottom-full end-0 mb-2 h-24 w-24">
                <div className="relative h-full w-full">
                  <div
                    className="btn btn-xs absolute right-1 top-1 opacity-70"
                    onClick={() => setPreviewImage(undefined)}
                  >
                    x
                  </div>

                  <img src={previewImage} className="object-fit h-24 w-24 rounded-md" />
                </div>
              </div>
            )}
          </div>

          {children || (
            <button className="btn btn-neutral" disabled={noServer}>
              Send
            </button>
          )}
        </form>
      </div>
    )
  },
)

const ChatBox = observer(() => {
  const chat = chatStore.selectedChat

  const scrollableFeedRef = useRef<ScrollableFeed>(null)

  const sendMessage = async () => {
    if (!chat) return

    const incomingMessage = chat.createIncomingMessage()

    chat.generateMessage(incomingMessage).finally(() => {
      scrollableFeedRef.current?.scrollToBottom()
    })
  }

  useEffect(() => {
    //no op

    //cleanup
    return OllmaApi.cancelStream
  }, [])

  if (!chat) return null

  const handleMessageToSend = (userMessage: string, image?: string) => {
    console.timeLog('handling message')
    chat.addUserMessage(userMessage, image)

    sendMessage()
  }

  const disableRegeneration = !!chat.incomingMessage
  const incomingUniqId = chat.incomingMessage?.uniqId

  return (
    <div className="flex max-h-full min-h-full w-full min-w-full max-w-full flex-col overflow-x-auto overflow-y-hidden rounded-md">
      <ScrollableFeed
        ref={scrollableFeedRef}
        className="no-scrollbar flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-hidden"
        animateScroll={(element, offset) => element.scrollBy({ top: offset, behavior: 'smooth' })}
      >
        {chat.messages.map(message =>
          message.uniqId === incomingUniqId ? (
            <IncomingMessage key={message.uniqId} />
          ) : (
            <Message
              message={message}
              key={message.uniqId}
              onDestroy={() => chat.deleteMessage(message.uniqId)}
              disableRegeneration={disableRegeneration}
            />
          ),
        )}
      </ScrollableFeed>

      <ChatBoxInputRow onSend={handleMessageToSend}>
        {chat.isGettingData && (
          <button
            type="button"
            className="btn btn-outline btn-error opacity-40"
            onClick={OllmaApi.cancelStream}
          >
            Stop
          </button>
        )}
      </ChatBoxInputRow>
    </div>
  )
})

export default ChatBox
