'use client'

import AIAbilities from './landingChatbot/AIAbilities'
import AIAbout from './landingChatbot/AIAbout'
import AIBanner from './landingChatbot/AIBanner'
import AIFAQ from './landingChatbot/AIFAQ'
import AIStatistics from './landingChatbot/AIStatistics'
import ScrollToTopButton from '../utils/ScrollToTopButton'

export default function AILanding() {
  return (
    <div className='bg-black'>
      <AIBanner />
      <AIAbout />
      <AIAbilities />
      <AIStatistics />
      <AIFAQ />
      <ScrollToTopButton />
    </div>
  )
}
