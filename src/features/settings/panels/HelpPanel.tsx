import { observer } from 'mobx-react-lite'

import CopyButton from '~/components/CopyButton'

const OLLAMA_CODE = 'OLLAMA_ORIGINS=*.github.io ollama serve'
const POWERSHELL_OLLAMA_CODE = '$env:OLLAMA_ORIGINS="https://%2A.github.io/"; ollama serve'

const HelpPanel = observer(() => {
  return (
    <div className="w-full">
      <h3 className="pb-3 text-xl font-bold">How to connect to Ollama Server:</h3>

      <div className="flex flex-col gap-2">
        <p>By default, Ollama allows cross origin requests from 127.0.0.1 and 0.0.0.0.</p>{' '}
        <p>
          To use custom origins (like this one), you can set
          <span className="prose mx-1">
            <code>OLLAMA_ORIGINS</code>
          </span>
          when starting ollama:
        </p>
      </div>

      <div className="my-4 flex flex-row place-content-center gap-2">
        <div className="prose">
          <code>{OLLAMA_CODE}</code>
        </div>

        <CopyButton className="btn swap btn-sm" text={OLLAMA_CODE} />
      </div>

      <div className="my-4 flex flex-row place-content-center gap-2">
        <div className="prose">
          Powershell version: <code>{POWERSHELL_OLLAMA_CODE}</code>
        </div>

        <CopyButton className="btn swap btn-sm" text={POWERSHELL_OLLAMA_CODE} />
      </div>

      <div>
        Find out more about Ollama on their website:
        <a href="https://ollama.com/" className=" link self-center">
          https://ollama.com/
        </a>
      </div>
    </div>
  )
})

export default HelpPanel
