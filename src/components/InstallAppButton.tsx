import { useEffect, useState } from 'react'
import { Download, X } from './Icons'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (installed || window.matchMedia('(display-mode: standalone)').matches) return null

  async function install() {
    if (installEvent) {
      await installEvent.prompt()
      await installEvent.userChoice
      setInstallEvent(null)
      return
    }
    setShowIosHint(true)
  }

  return (
    <>
      <button className="install-button" onClick={install} title="安装到手机">
        <Download size={15} />
        安装应用
      </button>
      {showIosHint && (
        <div className="install-hint-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowIosHint(false)}>
          <section className="install-hint-card" role="dialog" aria-modal="true" aria-label="安装拾图">
            <button className="icon-button install-hint-close" onClick={() => setShowIosHint(false)} aria-label="关闭"><X size={18} /></button>
            <div className="install-hint-icon"><Download size={21} /></div>
            <p className="eyebrow">ADD TO HOME SCREEN</p>
            <h2>把拾图放到手机桌面</h2>
            <p>在手机浏览器的分享菜单中选择「添加到主屏幕」，之后就能像普通 App 一样打开。</p>
            <button className="save-button" onClick={() => setShowIosHint(false)}>知道了</button>
          </section>
        </div>
      )}
    </>
  )
}
