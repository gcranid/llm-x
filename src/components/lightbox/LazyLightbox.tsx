import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Lightbox, { Slide } from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import _ from 'lodash'

import { chatStore } from '~/models/ChatStore'
import CachedStorage from '~/utils/CachedStorage'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/captions.css'

const LazyLightbox = observer(() => {
  const [slides, setSlides] = useState<Array<Slide & { uniqId: string }>>([])
  const chat = chatStore.selectedChat

  const getAllSlideImages = async () => {
    if (!chat) return

    const slides: Array<Slide & { uniqId: string }> = []

    for (const slide of chat.lightboxSlides) {
      const src = await CachedStorage.get(slide.src)

      slides.push({
        ...slide,
        src: src ?? '',
      })
    }

    setSlides(slides)
  }

  useEffect(() => {
    getAllSlideImages()
  }, [chat?.lightboxSlides?.length])

  if (!chat) return null

  const index = chat.lightboxImageUrlIndex
  if (index === -1 || _.isEmpty(slides)) return null

  return (
    <Lightbox
      close={chat.closeLightbox}
      plugins={[Thumbnails, Download, Captions, Zoom]}
      download={{
        download: ({ slide, saveAs }) => {
          let name: string | undefined

          if (_.isString(slide.description)) {
            name = _.snakeCase(slide.description)
          }

          saveAs(slide.src, name)
        },
      }}
      index={index}
      carousel={{ finite: true }}
      on={{
        view: ({ index }) => {
          const { src, uniqId } = chat.lightboxSlides[index]

          return chat.setLightboxMessageById(uniqId, src)
        },
      }}
      slides={slides}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ maxZoomPixelRatio: 7 }}
      open
    />
  )
})

export default LazyLightbox
