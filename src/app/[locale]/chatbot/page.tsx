'use client'

import AIAbilities from './landingchatbot/AIAbilities'
import AIAbout from './landingchatbot/AIAbout'
import AIBanner from './landingchatbot/AIBanner'
import AIFAQ from './landingchatbot/AIFAQ'
import AIStatistics from './landingchatbot/AIStatistics'
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
