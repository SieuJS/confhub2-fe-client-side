// src/hooks/journals/useJournalResults.ts
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  JournalApiResponse,
  JournalData
} from '../../models/response/journal.response'
import { appConfig } from '@/src/middleware'

// Danh sách tất cả các key filter hợp lệ từ API
const VALID_FILTERS = [
  'search',
  'areas',
  'publisher',
  'country',
  'region',
  'type',
  'quartile',
  'category',
  'issn',
  'topic',
  'hIndex'
]

const useJournalResults = () => {
  const [journals, setJournals] = useState<JournalData[] | undefined>(undefined)
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const journalsPerPage = 12

  const fetchJournals = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams(searchParams.toString())

    // Xóa các param không hợp lệ để đảm bảo URL sạch
    for (const [key] of params.entries()) {
      if (
        !VALID_FILTERS.includes(key) &&
        !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)
      ) {
        params.delete(key)
      }
    }
    
    // Đảm bảo các tham số filter từ URL được thêm vào request
    // URLSearchParams đã chứa các giá trị này từ searchParams.toString()
    // nên không cần thêm lại, chỉ cần đảm bảo chúng không bị xóa.

    // Thiết lập pagination và sorting
    params.set('limit', journalsPerPage.toString())
    if (!params.has('page')) {
      params.set('page', '1')
    }
    if (!params.has('sortBy')) {
      params.set('sortBy', 'createdAt') // Giá trị mặc định
    }
     if (!params.has('sortOrder')) {
      params.set('sortOrder', 'desc') // Giá trị mặc định
    }


    try {
      const apiUrl = `${
        appConfig.NEXT_PUBLIC_DATABASE_URL
      }/api/v1/journals?${params.toString()}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`)
      }

      const apiResponse: JournalApiResponse = await response.json()
      setJournals(apiResponse.data)
      setMeta(apiResponse.meta)
    } catch (err: any) {
      console.error('Failed to fetch journals:', err)
      setError(err.message)
      setJournals([])
      setMeta({ total: 0, page: 1, limit: journalsPerPage, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [searchParams, journalsPerPage])

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const paginate = useCallback(
    (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > meta.totalPages) {
        return
      }
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      current.set('page', pageNumber.toString())
      router.push(`${pathname}?${current.toString()}`)
    },
    [searchParams, pathname, router, meta.totalPages]
  )

  const handleSortByChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newSortBy = event.target.value
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      current.set('sortBy', newSortBy)
      current.set('page', '1')
      router.push(`${pathname}?${current.toString()}`)
    },
    [searchParams, pathname, router]
  )

  return {
    journals,
    totalJournals: meta.total,
    currentPage: meta.page,
    journalsPerPage: meta.limit,
    totalPages: meta.totalPages,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    loading,
    error,
    paginate,
    handleSortByChange
  }
}

export default useJournalResults