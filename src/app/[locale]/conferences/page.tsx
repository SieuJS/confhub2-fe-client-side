import { useTranslations } from 'next-intl'
import SearchSection from '../components/SearchSection'
import ResultsSection from '../components/ResultsSection'

export default function Conferences() {
  const t = useTranslations('')
  return (
    <div className='px-10 py-10 text-center text-2xl'>
      <SearchSection />
      <ResultsSection />
    </div>
  )
}
