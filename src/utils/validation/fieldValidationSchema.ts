// src/utils/validation/fieldValidationSchema.ts

import { ValidationRule } from './types'

/**
 * Sơ đồ validation cho các trường trong form (trừ mảng `dates`).
 * Mỗi key là tên của một trường (hỗ trợ dot-notation cho object lồng nhau).
 * Mỗi value là một mảng các quy tắc (ValidationRule) cho trường đó.
 */
export const fieldValidationSchema: Record<string, ValidationRule[]> = {
  title: [
    (value, _, t) =>
      !value?.trim() ? t('Please_enter_the_conference_name') : null,
    (value, allValues, t) =>
      value?.trim().toLowerCase() === allValues.acronym?.trim().toLowerCase()
        ? t('Title_and_Acronym_cannot_be_the_same')
        : null
  ],
  acronym: [
    (value, _, t) => (!value?.trim() ? t('Please_enter_the_acronym') : null),
    (value, allValues, t) =>
      value?.trim().toLowerCase() === allValues.title?.trim().toLowerCase()
        ? t('Title_and_Acronym_cannot_be_the_same')
        : null
  ],
  link: [
    (value, _, t) => (!value?.trim() ? t('Please_enter_a_valid_link') : null),
    (value, _, t) =>
      value && !value.startsWith('http://') && !value.startsWith('https://')
        ? t('Please_enter_a_valid_link_starting_with_http_or_https')
        : null
  ],
  // Sửa lỗi chính tả tên trường đã có
  cfpLink: [
    (value, _, t) =>
      value && !value.startsWith('http://') && !value.startsWith('https://')
        ? t('Please_enter_a_valid_link_starting_with_http_or_https')
        : null,
    (value, allValues, t) =>
      value?.trim() && value.trim() === allValues.link?.trim()
        ? t('Call_for_papers_link_cannot_be_the_same_as_the_official_website')
        : null,
    (value, allValues, t) =>
      value?.trim() && value.trim() === allValues.impLink?.trim()
        ? t('Call_for_papers_and_important_dates_links_cannot_be_the_same')
        : null
  ],
  impLink: [
    (value, _, t) =>
      value && !value.startsWith('http://') && !value.startsWith('https://')
        ? t('Please_enter_a_valid_link_starting_with_http_or_https')
        : null,
    (value, allValues, t) =>
      value?.trim() && value.trim() === allValues.link?.trim()
        ? t('Important_dates_link_cannot_be_the_same_as_the_official_website')
        : null,
    (value, allValues, t) =>
      value?.trim() && value.trim() === allValues.cfpLink?.trim()
        ? t('Call_for_papers_and_important_dates_links_cannot_be_the_same')
        : null
  ],
  type: [
    (value, _, t) => (!value ? t('Please_select_the_conference_type') : null)
  ],
  'location.address': [
    (value, allValues, t) =>
      (allValues.type === 'Offline' || allValues.type === 'Hybrid') &&
      !value?.trim()
        ? t('Please_enter_the_address')
        : null
  ],
  'location.continent': [
    (value, allValues, t) =>
      (allValues.type === 'Offline' || allValues.type === 'Hybrid') && !value
        ? t('Please_select_the_continent')
        : null
  ],
  'location.country': [
    (value, allValues, t) =>
      (allValues.type === 'Offline' || allValues.type === 'Hybrid') && !value
        ? t('Please_select_the_country')
        : null
  ],
  // --- BẮT ĐẦU THAY ĐỔI: Thêm validation cho summary ---
  summary: [
    (value, _, t) =>
      !value?.trim() ? t('Please_enter_the_conference_summary') : null,
    (value, _, t) =>
      value && value.trim().length < 50
        ? t('Summary_must_be_at_least_characters', { count: 50 })
        : null,
    (value, _, t) =>
      value && value.length > 2000
        ? t('Summary_cannot_exceed_characters', { count: 2000 })
        : null
  ],
  // --- KẾT THÚC THAY ĐỔI ---
  callForPaper: [
    (value, _, t) =>
      !value?.trim() ? t('Please_enter_the_Call_for_Papers') : null,
    (value, _, t) =>
      value && value.trim().length < 100
        ? t('Call_for_Papers_must_be_at_least_characters', { count: 100 })
        : null,
    (value, _, t) =>
      value && value.length > 10000
        ? t('Call_for_papers_cannot_exceed_characters', { count: 10000 })
        : null
  ]
}