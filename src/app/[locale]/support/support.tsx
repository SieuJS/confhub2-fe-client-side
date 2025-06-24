// src/app/[locale]/support/support.tsx

'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

const Support = () => {
  const t = useTranslations('SupportPage') // Namespace cho các chuỗi UI của trang Support
  const tf = useTranslations('FAQ') // Namespace riêng cho các câu hỏi và câu trả lời FAQ

  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // ... (phần còn lại của faqCategories và faqData không đổi)
  const faqCategories = [
    {
      name: tf('faq_category_login_and_registration'),
      value: 'login_and_registration'
    },
    {
      name: tf('faq_category_account_registration'),
      value: 'account_registration'
    },
    {
      name: tf('faq_category_navigation_bar_header'),
      value: 'navigation_bar_header'
    },
    {
      name: tf('faq_category_search_conferences'),
      value: 'search_conferences'
    },
    {
      name: tf('faq_category_conference_detail_page'),
      value: 'conference_detail_page'
    },
    {
      name: tf('faq_category_conference_feedback'),
      value: 'conference_feedback'
    },
    {
      name: tf('faq_category_notification_system'),
      value: 'notification_system'
    },
    { name: tf('faq_category_dashboard'), value: 'dashboard' },
    {
      name: tf('faq_category_dashboard_personal_profile'),
      value: 'dashboard_personal_profile'
    },
    {
      name: tf('faq_category_dashboard_my_conferences'),
      value: 'dashboard_my_conferences'
    },
    {
      name: tf('faq_category_dashboard_followed_conferences'),
      value: 'dashboard_followed_conferences'
    },
    {
      name: tf('faq_category_dashboard_blacklisted_conferences'),
      value: 'dashboard_blacklisted_conferences'
    },
    {
      name: tf('faq_category_dashboard_notesevents'),
      value: 'dashboard_notesevents'
    },
    {
      name: tf('faq_category_dashboard_settings'),
      value: 'dashboard_settings'
    },
    {
      name: tf('faq_category_add_new_conference_publish'),
      value: 'add_new_conference_publish'
    },

    { name: tf('faq_category_support'), value: 'support' },
    {
      name: tf('faq_category_chatbot_homepage_popup'),
      value: 'chatbot_homepage_popup'
    },
    {
      name: tf('faq_category_chatbot_live_chat_page'),
      value: 'chatbot_live_chat_page'
    },
    { name: tf('faq_category_visualize_data'), value: 'visualize_data' },
    {
      name: tf('faq_category_features_by_user_role'),
      value: 'features_by_user_role'
    }
  ]

  const faqData = [
    // Section 1: Login and Registration
    {
      category: 'login_and_registration',
      question: tf('faq_q_login_1_successful_login'),
      answer: tf('faq_a_login_1_successful_login')
    },
    {
      category: 'login_and_registration',
      question: tf('faq_q_login_2_failed_incorrect_password'),
      answer: tf('faq_a_login_2_failed_incorrect_password')
    },
    {
      category: 'login_and_registration',
      question: tf('faq_q_login_3_failed_email_not_registered'),
      answer: tf('faq_a_login_3_failed_email_not_registered')
    },
    {
      category: 'login_and_registration',
      question: tf('faq_q_login_4_failed_empty_fields'),
      answer: tf('faq_a_login_4_failed_empty_fields')
    },
    {
      category: 'login_and_registration',
      question: tf('faq_q_login_5_forgot_password'),
      answer: tf('faq_a_login_5_forgot_password')
    },
    {
      category: 'login_and_registration',
      question: tf('faq_q_login_6_access_registration'),
      answer: tf('faq_a_login_6_access_registration')
    },
    {
      category: 'login_and_registration',
      question: tf('faq_q_login_7_google_signin'),
      answer: tf('faq_a_login_7_google_signin')
    },

    // Section 2: Account Registration
    {
      category: 'account_registration',
      question: tf('faq_q_accountreg_1_successful_registration'),
      answer: tf('faq_a_accountreg_1_successful_registration')
    },
    {
      category: 'account_registration',
      question: tf('faq_q_accountreg_2_failed_empty_fields'),
      answer: tf('faq_a_accountreg_2_failed_empty_fields')
    },
    {
      category: 'account_registration',
      question: tf('faq_q_accountreg_3_failed_email_exists'),
      answer: tf('faq_a_accountreg_3_failed_email_exists')
    },
    {
      category: 'account_registration',
      question: tf('faq_q_accountreg_4_failed_password_mismatch'),
      answer: tf('faq_a_accountreg_4_failed_password_mismatch')
    },
    {
      category: 'account_registration',
      question: tf('faq_q_accountreg_5_failed_under_18'),
      answer: tf('faq_a_accountreg_5_failed_under_18')
    },
    {
      category: 'account_registration',
      question: tf('faq_q_accountreg_6_failed_short_password'),
      answer: tf('faq_a_accountreg_6_failed_short_password')
    },
    {
      category: 'account_registration',
      question: tf('faq_q_accountreg_7_back_to_login'),
      answer: tf('faq_a_accountreg_7_back_to_login')
    },

    // Section 3: Navigation Bar (Header)
    {
      category: 'navigation_bar_header',
      question: tf('faq_q_navbar_1_access_main_pages'),
      answer: tf('faq_a_navbar_1_access_main_pages')
    },
    {
      category: 'navigation_bar_header',
      question: tf('faq_q_navbar_2_change_language'),
      answer: tf('faq_a_navbar_2_change_language')
    },
    {
      category: 'navigation_bar_header',
      question: tf('faq_q_navbar_3_user_menu_loggedin'),
      answer: tf('faq_a_navbar_3_user_menu_loggedin')
    },
    {
      category: 'navigation_bar_header',
      question: tf('faq_q_navbar_4_logout'),
      answer: tf('faq_a_navbar_4_logout')
    },
    {
      category: 'navigation_bar_header',
      question: tf('faq_q_navbar_5_change_theme'),
      answer: tf('faq_a_navbar_5_change_theme')
    },

    // Section 4: Search Conferences
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_1_access_search_page'),
      answer: tf('faq_a_searchconf_1_access_search_page')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_2_basic_search'),
      answer: tf('faq_a_searchconf_2_basic_search')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_3_search_by_type'),
      answer: tf('faq_a_searchconf_3_search_by_type')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_4_search_by_date_range'),
      answer: tf('faq_a_searchconf_4_search_by_date_range')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_5_search_by_location'),
      answer: tf('faq_a_searchconf_5_search_by_location')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_6_show_hide_advanced_options'),
      answer: tf('faq_a_searchconf_6_show_hide_advanced_options')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_7_advanced_search_filters'),
      answer: tf('faq_a_searchconf_7_advanced_search_filters')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_8_non_existent_keyword'),
      answer: tf('faq_a_searchconf_8_non_existent_keyword')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_9_search_empty_fields'),
      answer: tf('faq_a_searchconf_9_search_empty_fields')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_10_clear_filters'),
      answer: tf('faq_a_searchconf_10_clear_filters')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_11_remove_specific_filter'),
      answer: tf('faq_a_searchconf_11_remove_specific_filter')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_12_sort_results'),
      answer: tf('faq_a_searchconf_12_sort_results')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_13_change_results_per_page'),
      answer: tf('faq_a_searchconf_13_change_results_per_page')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_14_use_pagination'),
      answer: tf('faq_a_searchconf_14_use_pagination')
    },
    {
      category: 'search_conferences',
      question: tf('faq_q_searchconf_15_view_conference_details'),
      answer: tf('faq_a_searchconf_15_view_conference_details')
    },

    // Section 5: Conference Detail Page
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_1_view_detailed_info'),
      answer: tf('faq_a_confdetail_1_view_detailed_info')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_2_switch_info_tabs'),
      answer: tf('faq_a_confdetail_2_switch_info_tabs')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_3_click_topic_tag'),
      answer: tf('faq_a_confdetail_3_click_topic_tag')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_4_follow_conference'),
      answer: tf('faq_a_confdetail_4_follow_conference')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_5_unfollow_conference'),
      answer: tf('faq_a_confdetail_5_unfollow_conference')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_6_add_to_calendar'),
      answer: tf('faq_a_confdetail_6_add_to_calendar')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_7_blacklist_conference'),
      answer: tf('faq_a_confdetail_7_blacklist_conference')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_8_remove_from_blacklist'),
      answer: tf('faq_a_confdetail_8_remove_from_blacklist')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_9_access_official_website'),
      answer: tf('faq_a_confdetail_9_access_official_website')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_10_share_conference'),
      answer: tf('faq_a_confdetail_10_share_conference')
    },
    {
      category: 'conference_detail_page',
      question: tf('faq_q_confdetail_11_update_information'),
      answer: tf('faq_a_confdetail_11_update_information')
    },

    // Section 6: Conference Feedback
    {
      category: 'conference_feedback',
      question: tf('faq_q_conffeedback_1_view_feedback_section'),
      answer: tf('faq_a_conffeedback_1_view_feedback_section')
    },
    {
      category: 'conference_feedback',
      question: tf('faq_q_conffeedback_2_submit_new_feedback'),
      answer: tf('faq_a_conffeedback_2_submit_new_feedback')
    },
    {
      category: 'conference_feedback',
      question: tf('faq_q_conffeedback_3_filter_reviews_by_rating'),
      answer: tf('faq_a_conffeedback_3_filter_reviews_by_rating')
    },
    {
      category: 'conference_feedback',
      question: tf('faq_q_conffeedback_4_sort_reviews'),
      answer: tf('faq_a_conffeedback_4_sort_reviews')
    },

    // Section 7: Notification System
    {
      category: 'notification_system',
      question: tf('faq_q_notification_1_open_quick_panel'),
      answer: tf('faq_a_notification_1_open_quick_panel')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_2_view_content_status_popup'),
      answer: tf('faq_a_notification_2_view_content_status_popup')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_3_mark_all_read_popup'),
      answer: tf('faq_a_notification_3_mark_all_read_popup')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_4_redirect_from_notification_popup'),
      answer: tf('faq_a_notification_4_redirect_from_notification_popup')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_5_view_all_notifications_popup'),
      answer: tf('faq_a_notification_5_view_all_notifications_popup')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_6_view_all_full_page'),
      answer: tf('faq_a_notification_6_view_all_full_page')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_7_filter_by_status_full_page'),
      answer: tf('faq_a_notification_7_filter_by_status_full_page')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_8_search_notifications_full_page'),
      answer: tf('faq_a_notification_8_search_notifications_full_page')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_9_select_notifications'),
      answer: tf('faq_a_notification_9_select_notifications')
    },
    {
      category: 'notification_system',
      question: tf('faq_q_notification_10_perform_bulk_actions'),
      answer: tf('faq_a_notification_10_perform_bulk_actions')
    },

    // Section 8: Dashboard
    {
      category: 'dashboard',
      question: tf('faq_q_dashboard_1_navigate_sidebar'),
      answer: tf('faq_a_dashboard_1_navigate_sidebar')
    },
    {
      category: 'dashboard',
      question: tf('faq_q_dashboard_2_close_expand_sidebar'),
      answer: tf('faq_a_dashboard_2_close_expand_sidebar')
    },

    // Section 9: Dashboard: Personal Profile
    {
      category: 'dashboard_personal_profile',
      question: tf('faq_q_profile_1_view_profile_info'),
      answer: tf('faq_a_profile_1_view_profile_info')
    },
    {
      category: 'dashboard_personal_profile',
      question: tf('faq_q_profile_2_edit_profile_info'),
      answer: tf('faq_a_profile_2_edit_profile_info')
    },
    {
      category: 'dashboard_personal_profile',
      question: tf('faq_q_profile_3_change_password'),
      answer: tf('faq_a_profile_3_change_password')
    },

    // Section 10: Dashboard: My Conferences
    {
      category: 'dashboard_my_conferences',
      question: tf('faq_q_myconf_1_view_by_status'),
      answer: tf('faq_a_myconf_1_view_by_status')
    },
    {
      category: 'dashboard_my_conferences',
      question: tf('faq_q_myconf_2_add_new_conference'),
      answer: tf('faq_a_myconf_2_add_new_conference')
    },
    {
      category: 'dashboard_my_conferences',
      question: tf('faq_q_myconf_3_refresh_list'),
      answer: tf('faq_a_myconf_3_refresh_list')
    },

    // Section 11: Dashboard: Followed Conferences
    {
      category: 'dashboard_followed_conferences',
      question: tf('faq_q_followed_1_view_list'),
      answer: tf('faq_a_followed_1_view_list')
    },
    {
      category: 'dashboard_followed_conferences',
      question: tf('faq_q_followed_2_go_to_detail'),
      answer: tf('faq_a_followed_2_go_to_detail')
    },
    {
      category: 'dashboard_followed_conferences',
      question: tf('faq_q_followed_3_refresh_list'),
      answer: tf('faq_a_followed_3_refresh_list')
    },

    // Section 12: Dashboard: Blacklisted Conferences
    {
      category: 'dashboard_blacklisted_conferences',
      question: tf('faq_q_blacklisted_1_view_list'),
      answer: tf('faq_a_blacklisted_1_view_list')
    },
    {
      category: 'dashboard_blacklisted_conferences',
      question: tf('faq_q_blacklisted_2_go_to_detail'),
      answer: tf('faq_a_blacklisted_2_go_to_detail')
    },
    {
      category: 'dashboard_blacklisted_conferences',
      question: tf('faq_q_blacklisted_3_refresh_list'),
      answer: tf('faq_a_blacklisted_3_refresh_list')
    },

    // Section 13: Dashboard: Notes/Events
    {
      category: 'dashboard_notesevents',
      question: tf('faq_q_notes_1_view_upcoming_notes'),
      answer: tf('faq_a_notes_1_view_upcoming_notes')
    },
    {
      category: 'dashboard_notesevents',
      question: tf('faq_q_notes_2_filter_by_type'),
      answer: tf('faq_a_notes_2_filter_by_type')
    },
    {
      category: 'dashboard_notesevents',
      question: tf('faq_q_notes_3_use_calendar_view'),
      answer: tf('faq_a_notes_3_use_calendar_view')
    },
    {
      category: 'dashboard_notesevents',
      question: tf('faq_q_notes_4_go_to_details_from_list'),
      answer: tf('faq_a_notes_4_go_to_details_from_list')
    },
    {
      category: 'dashboard_notesevents',
      question: tf('faq_q_notes_5_search_notes'),
      answer: tf('faq_a_notes_5_search_notes')
    },

    // Section 14: Dashboard: Settings
    {
      category: 'dashboard_settings',
      question: tf('faq_q_settings_1_view_options'),
      answer: tf('faq_a_settings_1_view_options')
    },
    {
      category: 'dashboard_settings',
      question: tf('faq_q_settings_2_change_toggle_status'),
      answer: tf('faq_a_settings_2_change_toggle_status')
    },
    {
      category: 'dashboard_settings',
      question: tf('faq_q_settings_3_delete_account'),
      answer: tf('faq_a_settings_3_delete_account')
    },

    // Section 15: Add New Conference (Publish)
    {
      category: 'add_new_conference_publish',
      question: tf('faq_q_publish_1_access_add_new_page'),
      answer: tf('faq_a_publish_1_access_add_new_page')
    },
    {
      category: 'add_new_conference_publish',
      question: tf('faq_q_publish_2_successful_addition_process'),
      answer: tf('faq_a_publish_2_successful_addition_process')
    },
    {
      category: 'add_new_conference_publish',
      question: tf('faq_q_publish_3_addition_failure_validation'),
      answer: tf('faq_a_publish_3_addition_failure_validation')
    },

    // Section 18: Support
    {
      category: 'support',
      question: tf('faq_q_support_1_access_support_page'),
      answer: tf('faq_a_support_1_access_support_page')
    },
    {
      category: 'support',
      question: tf('faq_q_support_2_submit_contact_form'),
      answer: tf('faq_a_support_2_submit_contact_form')
    },
    {
      category: 'support',
      question: tf('faq_q_support_3_view_terms_privacy'),
      answer: tf('faq_a_support_3_view_terms_privacy')
    },
    {
      category: 'support',
      question: tf('faq_q_support_4_search_faq'),
      answer: tf('faq_a_support_4_search_faq')
    },
    {
      category: 'support',
      question: tf('faq_q_support_5_filter_faq_by_category'),
      answer: tf('faq_a_support_5_filter_faq_by_category')
    },
    {
      category: 'support',
      question: tf('faq_q_support_6_expand_collapse_faq'),
      answer: tf('faq_a_support_6_expand_collapse_faq')
    },

    // Section 19: Chatbot (Homepage Popup)
    {
      category: 'chatbot_homepage_popup',
      question: tf('faq_q_chatbotpopup_1_open_window'),
      answer: tf('faq_a_chatbotpopup_1_open_window')
    },
    {
      category: 'chatbot_homepage_popup',
      question: tf('faq_q_chatbotpopup_2_close_window'),
      answer: tf('faq_a_chatbotpopup_2_close_window')
    },
    {
      category: 'chatbot_homepage_popup',
      question: tf('faq_q_chatbotpopup_3_type_send_message'),
      answer: tf('faq_a_chatbotpopup_3_type_send_message')
    },
    {
      category: 'chatbot_homepage_popup',
      question: tf('faq_q_chatbotpopup_4_use_suggested_questions'),
      answer: tf('faq_a_chatbotpopup_4_use_suggested_questions')
    },
    {
      category: 'chatbot_homepage_popup',
      question: tf('faq_q_chatbotpopup_5_open_close_settings'),
      answer: tf('faq_a_chatbotpopup_5_open_close_settings')
    },
    {
      category: 'chatbot_homepage_popup',
      question: tf('faq_q_chatbotpopup_6_change_language_settings'),
      answer: tf('faq_a_chatbotpopup_6_change_language_settings')
    },
    {
      category: 'chatbot_homepage_popup',
      question: tf('faq_q_chatbotpopup_7_view_connection_status'),
      answer: tf('faq_a_chatbotpopup_7_view_connection_status')
    },

    // Section 20: Chatbot (Live Chat Page)
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_1_access_live_chat'),
      answer: tf('faq_a_chatbotlive_1_access_live_chat')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_2_select_regular_chat'),
      answer: tf('faq_a_chatbotlive_2_select_regular_chat')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_3_start_new_conversation'),
      answer: tf('faq_a_chatbotlive_3_start_new_conversation')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_4_send_text_message'),
      answer: tf('faq_a_chatbotlive_4_send_text_message')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_5_receive_text_response'),
      answer: tf('faq_a_chatbotlive_5_receive_text_response')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_6_click_initial_suggestion'),
      answer: tf('faq_a_chatbotlive_6_click_initial_suggestion')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_7_click_link_in_response'),
      answer: tf('faq_a_chatbotlive_7_click_link_in_response')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_8_view_chat_history'),
      answer: tf('faq_a_chatbotlive_8_view_chat_history')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_9_load_from_history'),
      answer: tf('faq_a_chatbotlive_9_load_from_history')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_10_change_bot_language'),
      answer: tf('faq_a_chatbotlive_10_change_bot_language')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_11_select_output_text'),
      answer: tf('faq_a_chatbotlive_11_select_output_text')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_12_select_output_audio'),
      answer: tf('faq_a_chatbotlive_12_select_output_audio')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_13_select_live_stream_mode'),
      answer: tf('faq_a_chatbotlive_13_select_live_stream_mode')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_14_voice_input_start_recording'),
      answer: tf('faq_a_chatbotlive_14_voice_input_start_recording')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_15_voice_input_stop_recording'),
      answer: tf('faq_a_chatbotlive_15_voice_input_stop_recording')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_16_receive_audio_response'),
      answer: tf('faq_a_chatbotlive_16_receive_audio_response')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_17_play_back_audio_response'),
      answer: tf('faq_a_chatbotlive_17_play_back_audio_response')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_18_pause_resume_audio'),
      answer: tf('faq_a_chatbotlive_18_pause_resume_audio')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_19_change_chatbot_voice'),
      answer: tf('faq_a_chatbotlive_19_change_chatbot_voice')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_20_switch_language_live_audio'),
      answer: tf('faq_a_chatbotlive_20_switch_language_live_audio')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_21_view_connected_status_live'),
      answer: tf('faq_a_chatbotlive_21_view_connected_status_live')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_22_handling_connection_loss'),
      answer: tf('faq_a_chatbotlive_22_handling_connection_loss')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_23_functionality_search_details_map'),
      answer: tf('faq_a_chatbotlive_23_functionality_search_details_map')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_24_functionality_guidance_follow'),
      answer: tf('faq_a_chatbotlive_24_functionality_guidance_follow')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_25_handling_out_of_scope'),
      answer: tf('faq_a_chatbotlive_25_handling_out_of_scope')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_26_view_thought_process'),
      answer: tf('faq_a_chatbotlive_26_view_thought_process')
    },
    {
      category: 'chatbot_live_chat_page',
      question: tf('faq_q_chatbotlive_27_copy_response'),
      answer: tf('faq_a_chatbotlive_27_copy_response')
    },

    // Section 21: Visualize Data
    {
      category: 'visualize_data',
      question: tf('faq_q_visualize_1_access_page'),
      answer: tf('faq_a_visualize_1_access_page')
    },
    {
      category: 'visualize_data',
      question: tf('faq_q_visualize_2_display_bar_chart'),
      answer: tf('faq_a_visualize_2_display_bar_chart')
    },
    {
      category: 'visualize_data',
      question: tf('faq_q_visualize_3_display_line_chart'),
      answer: tf('faq_a_visualize_3_display_line_chart')
    },
    {
      category: 'visualize_data',
      question: tf('faq_q_visualize_4_display_pie_chart'),
      answer: tf('faq_a_visualize_4_display_pie_chart')
    },
    {
      category: 'visualize_data',
      question: tf('faq_q_visualize_5_change_chart_title'),
      answer: tf('faq_a_visualize_5_change_chart_title')
    },
    {
      category: 'visualize_data',
      question: tf('faq_q_visualize_6_show_hide_legend'),
      answer: tf('faq_a_visualize_6_show_hide_legend')
    },
    {
      category: 'visualize_data',
      question: tf('faq_q_visualize_7_show_hide_toolbox'),
      answer: tf('faq_a_visualize_7_show_hide_toolbox')
    },

    // Section 22: Features by User Role
    {
      category: 'features_by_user_role',
      question: tf('faq_q_features_1_guest_and_loggedin'),
      answer: tf('faq_a_features_1_guest_and_loggedin')
    },
    {
      category: 'features_by_user_role',
      question: tf('faq_q_features_2_loggedin_only'),
      answer: tf('faq_a_features_2_loggedin_only')
    }
  ]

  const filteredFaqData = faqData.filter(
    item =>
      (selectedCategory === null || item.category === selectedCategory) &&
      (searchTerm === '' ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setExpandedIndex(null)
  }

  const handleCategoryClick = (categoryValue: string | null) => {
    setSelectedCategory(categoryValue)
    setExpandedIndex(null)
    setSearchTerm('')
  }
  return (
    <>
      <div className='w-full bg-gradient-to-r from-background to-background-secondary p-4 md:p-8'>
        <div className='container mx-auto'>
          <div className='flex flex-col items-center'>
            <h2 className='py-6 text-center text-2xl font-bold md:py-8 md:text-3xl'>
              {t('howCanWeHelpYou')}
            </h2>
          </div>
          <div className='relative mx-auto mb-8 max-w-2xl md:mb-12'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <svg
                className='h-5 w-5 '
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <input
              type='text'
              className='block w-full rounded-full border border-gray-300  py-3 pl-10 pr-3  shadow-sm placeholder:text-primary focus:border-button focus:outline-none focus:ring-1 focus:ring-button sm:text-sm'
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              suppressHydrationWarning={true} // <-- THÊM DÒNG NÀY
            />
          </div>
          <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
            <div className='w-full rounded-lg  p-4 shadow-lg  md:mb-0 md:w-1/4 lg:w-1/5'>
              <h3 className='mb-3 text-lg font-semibold  '>
                {t('categories')}
              </h3>
              <ul className='space-y-1'>
                <li
                  key='all'
                  className={`cursor-pointer rounded px-2 py-1 font-medium transition-colors duration-150 hover:bg-gray-10  ${
                    selectedCategory === null
                      ? 'dark:text-button-dark font-semibold text-button'
                      : ' '
                  }`}
                  onClick={() => handleCategoryClick(null)}
                >
                  {t('all')}
                </li>
                {faqCategories.map(category => (
                  <li
                    key={category.value}
                    className={`cursor-pointer rounded px-2 py-1 font-medium transition-colors duration-150 hover:bg-gray-10  ${
                      selectedCategory === category.value
                        ? 'dark:text-button-dark font-semibold text-button'
                        : ' '
                    }`}
                    onClick={() => handleCategoryClick(category.value)}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className='w-full rounded-lg  p-2 shadow-lg  md:w-3/4 lg:w-4/5'>
              <div className='space-y-2'>
                {filteredFaqData.length > 0 ? (
                  filteredFaqData.map((item, index) => (
                    <div
                      key={index}
                      className='overflow-hidden rounded-lg border border-gray-20   '
                    >
                      <div
                        className='flex cursor-pointer items-center justify-between px-4 py-3 transition-colors duration-150 hover:bg-gray-10 '
                        onClick={() => toggleAccordion(index)}
                        aria-expanded={expandedIndex === index}
                        aria-controls={`faq-content-${index}`}
                        id={`faq-header-${index}`}
                      >
                        <h3 className='text-base font-semibold   md:text-lg'>
                          {item.question}
                        </h3>
                        <svg
                          className={`h-5 w-5  transition-transform duration-200  ${
                            expandedIndex === index ? 'rotate-180' : ''
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M19 9l-7 7-7-7'
                          ></path>
                        </svg>
                      </div>
                      <div
                        id={`faq-content-${index}`}
                        role='region'
                        aria-labelledby={`faq-header-${index}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedIndex === index ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className='px-4 pb-3 pt-2 '>
                          {item.answer.split('\n').map((line, i, arr) => (
                            <React.Fragment key={i}>
                              {line.trim().startsWith('*   ') ? (
                                <span className='block pl-4'>
                                  {line.trim().substring(4)}
                                </span>
                              ) : line.trim().startsWith('* ') ? (
                                <span className='block pl-4'>
                                  {line.trim().substring(2)}
                                </span>
                              ) : (
                                line
                              )}
                              {i < arr.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='rounded-lg border border-gray-20  p-4 text-center  shadow-sm   '>
                    <p className=''>{t('noResultsFound')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Support
