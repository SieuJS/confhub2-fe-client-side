// src/hooks/conferenceDetails/useFormatConferenceData.ts

import { useMemo } from 'react'
import { ConferenceResponse } from '@/src/models/response/conference.response'

// Re-exporting types for easier import in other components
export type OrgType = ConferenceResponse['organizations'][number]
export type RankType = NonNullable<ConferenceResponse['ranks']>[number]

// MODIFIED: Thêm 'type' vào GroupedDateInfo
export type GroupedDateInfo = {
  name: string
  type: string // Thêm thuộc tính type
  isNew: boolean
  current: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }
  differentOldDates: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }[]
}


export type GroupedRankInfo = {
  source: string
  rank: string
  fieldsOfResearch: string[]
}

/**
 * A custom hook to process and derive data from the main conference object.
 * This encapsulates all the business logic for finding the latest organization,
 * grouping dates, and processing ranks.
 * @param conference The raw conference data.
 * @param t The translation function from next-intl.
 * @returns An object containing all the processed data for rendering.
 */
export const useFormatConferenceData = (
  conference: ConferenceResponse | null,
  t: (key: string) => string
) => {
  const latestOrganization = useMemo(() => {
    if (!conference?.organizations || conference.organizations.length === 0) {
      return null
    }
    return conference.organizations.reduce(
      (latest: OrgType, current: OrgType): OrgType => {
        let currentCreatedAt: Date | null = null
        try {
          const date = new Date(current.createdAt)
          if (!isNaN(date.getTime())) currentCreatedAt = date
        } catch { }
        let latestCreatedAt: Date | null = null
        try {
          const date = new Date(latest.createdAt)
          if (!isNaN(date.getTime())) latestCreatedAt = date
        } catch { }

        if (
          currentCreatedAt &&
          (!latestCreatedAt || currentCreatedAt > latestCreatedAt)
        ) {
          return current
        }
        return latest
      },
      conference.organizations[0]
    )
  }, [conference?.organizations])

  // MODIFIED: Toàn bộ logic tính toán groupedDates được cập nhật
  const groupedDates = useMemo((): GroupedDateInfo[] => {
    if (!conference?.organizations || !latestOrganization?.conferenceDates) {
      return []
    }

    const groupedDatesMap = new Map<string, GroupedDateInfo>()
    const latestOrgId = latestOrganization.id
    // Set này sẽ chứa các khóa kết hợp 'type-name' từ các bản ghi cũ
    const olderDateKeys = new Set<string>()

    // 1. Thu thập tất cả các khóa 'type-name' từ các organization cũ
    conference.organizations.forEach(org => {
      if (org.id === latestOrgId) return

      if (org.conferenceDates) {
        org.conferenceDates.forEach(oldDateItem => {
          if (oldDateItem?.name && oldDateItem.type) {
            const compositeKey = `${oldDateItem.type}-${oldDateItem.name}`
            olderDateKeys.add(compositeKey)
          }
        })
      }
    })

    // 2. Xây dựng map ban đầu từ latestOrganization, xác định ngày nào là 'NEW'
    latestOrganization.conferenceDates.forEach(dateItem => {
      if (dateItem?.name && dateItem.type) {
        const compositeKey = `${dateItem.type}-${dateItem.name}`
        const isNewName = !olderDateKeys.has(compositeKey)

        // Chỉ thêm vào map nếu chưa tồn tại để tránh trùng lặp trong chính latestOrganization
        if (!groupedDatesMap.has(compositeKey)) {
          groupedDatesMap.set(compositeKey, {
            name: dateItem.name,
            type: dateItem.type, // Lưu lại type
            isNew: isNewName,
            current: { fromDate: dateItem.fromDate, toDate: dateItem.toDate },
            differentOldDates: []
          })
        }
      }
    })

    // 3. Tìm các ngày cũ khác biệt và thêm vào 'differentOldDates'
    const addedOldDates = new Map<string, Set<string>>()
    conference.organizations.forEach(org => {
      if (org.id === latestOrgId) return

      if (org.conferenceDates) {
        org.conferenceDates.forEach(oldDateItem => {
          if (oldDateItem?.name && oldDateItem.type) {
            const compositeKey = `${oldDateItem.type}-${oldDateItem.name}`
            const groupInfo = groupedDatesMap.get(compositeKey)

            if (groupInfo) {
              const current = groupInfo.current
              const oldFrom = oldDateItem.fromDate
              const oldTo = oldDateItem.toDate
              const isDifferent =
                current.fromDate !== oldFrom || current.toDate !== oldTo

              if (isDifferent) {
                const oldDateValueKey = `${oldFrom || 'null'}|${oldTo || 'null'}`
                if (!addedOldDates.has(compositeKey)) {
                  addedOldDates.set(compositeKey, new Set<string>())
                }
                const valueSet = addedOldDates.get(compositeKey)!
                if (!valueSet.has(oldDateValueKey)) {
                  groupInfo.differentOldDates.push({
                    fromDate: oldFrom,
                    toDate: oldTo
                  })
                  valueSet.add(oldDateValueKey)
                }
              }
            }
          }
        })
      }
    })

    const result = Array.from(groupedDatesMap.values())

    // MODIFIED: Cập nhật logic sắp xếp
    // Sắp xếp để component dễ dàng xử lý hơn:
    // 1. Theo loại (type)
    // 2. Theo ngày bắt đầu (fromDate) - ngày sớm nhất lên trước
    // 3. Theo tên (name) nếu các điều kiện trên trùng nhau
    result.sort((a, b) => {
      const typeCompare = a.type.localeCompare(b.type);
      if (typeCompare !== 0) return typeCompare;

      const dateA = a.current.fromDate ? new Date(a.current.fromDate).getTime() : 0;
      const dateB = b.current.fromDate ? new Date(b.current.fromDate).getTime() : 0;

      // Xử lý trường hợp ngày không hợp lệ hoặc null
      if (dateA === 0 && dateB > 0) return 1;
      if (dateB === 0 && dateA > 0) return -1;
      if (dateA !== dateB) return dateA - dateB;

      return a.name.localeCompare(b.name);
    });

    return result
  }, [conference?.organizations, latestOrganization])

  const processedRanks = useMemo((): GroupedRankInfo[] => {
    if (!conference?.ranks || conference.ranks.length === 0) {
      return []
    }
    const rankGroups = new Map<string, GroupedRankInfo>()
    conference.ranks.forEach(rank => {
      const source = rank.source || t('Not_Available')
      const rankValue = rank.rank || t('Not_Available')

      // MODIFIED: Điều chỉnh logic cho fieldOfResearch
      let field = rank.fieldOfResearch;
      if (
        !field || // Kiểm tra null, undefined, rỗng
        field.trim() === '' || // Kiểm tra chuỗi rỗng sau khi trim
        field.toUpperCase() === 'UNDEFINED' // Kiểm tra chuỗi "UNDEFINED"
      ) {
        field = t('No_longer_used'); // Gán giá trị mong muốn
      }

      const groupKey = `${source}-${rankValue}`
      if (rankGroups.has(groupKey)) {
        const existingGroup = rankGroups.get(groupKey)!
        // Chỉ thêm field nếu nó chưa tồn tại trong mảng
        if (!existingGroup.fieldsOfResearch.includes(field)) {
          existingGroup.fieldsOfResearch.push(field)
        }
      } else {
        rankGroups.set(groupKey, {
          source: source,
          rank: rankValue,
          fieldsOfResearch: [field] // Luôn thêm field đã được xử lý
        })
      }
    })
    return Array.from(rankGroups.values())
  }, [conference?.ranks, t]) // Thêm t vào dependency array

  const summary = latestOrganization?.summary || latestOrganization?.summerize
  const callForPaper = latestOrganization?.callForPaper
  const primaryLocation = latestOrganization?.locations?.[0]
  const mainLink = latestOrganization?.link
  const cfpLink = latestOrganization?.cfpLink
  const impLink = latestOrganization?.impLink

  return {
    latestOrganization,
    groupedDates,
    processedRanks,
    summary,
    callForPaper,
    mainLink,
    cfpLink,
    impLink,
    primaryLocation
  }
}