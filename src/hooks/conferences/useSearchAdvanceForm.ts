// src/hooks/useSearchAdvanceForm.ts

import { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react'; // Add useEffect

interface UseSearchAdvanceFormProps {
  // ... (rest of your props)
  onSubmissionDateChange: (date: Date | null) => void;
  submissionDate: Date | null;
  onRankChange: (rank: string | null) => void;
  selectedRank: string | null;
  onSourceChange: (source: string | null) => void;
  selectedSource: string | null;
  onAverageScoreChange: (averageScore: string | null) => void;
  selectedAverageScore: string | null;
  onTopicsChange: (topics: string[]) => void;
  selectedTopics: string[];
  onFieldOfResearchChange: (fields: string[]) => void;
  selectedFieldsOfResearch: string[];
  onPublisherChange: (publisher: string | null) => void;
  selectedPublisher: string | null;
}

const useSearchAdvanceForm = ({
  onSubmissionDateChange,
  submissionDate,
  onRankChange,
  selectedRank,
  onSourceChange,
  selectedSource,
  onAverageScoreChange,
  selectedAverageScore,
  onTopicsChange,
  selectedTopics,
  onFieldOfResearchChange,
  selectedFieldsOfResearch,
  onPublisherChange,
  selectedPublisher,
}: UseSearchAdvanceFormProps) => {
  const [topicsInput, setTopicsInput] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [fieldOfResearchInput, setFieldOfResearchInput] = useState('');
  const [fieldOfResearchSuggestions, setFieldOfResearchSuggestions] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]); // State for fetched topics

  const availableFieldsOfResearch = [
    "Computer Science", "Information Technology", "Software Engineering", "Data Analytics", "Artificial Intelligence",
    "Cybersecurity", "Information Systems", "Human-Computer Interaction", "Bioinformatics", "Computational Linguistics"
    ];
  // Fetch topics from the backend when the component mounts
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference-organization/topics`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: string[] = await response.json(); // Type assertion
        console.log(data);
        setAvailableTopics(data); // Update state with fetched topics
      } catch (error) {
        console.error("Could not fetch topics:", error);
        // Optionally set an error state to display to the user
      }
    };

    fetchTopics();
  }, []); // Empty dependency array means this runs once on mount


  const handleTopicInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTopicsInput(inputValue);
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      const suggestions = availableTopics.filter(topic =>
        topic.toLowerCase().includes(trimmedInput.toLowerCase()) && !selectedTopics.includes(topic)
      );
      setTopicSuggestions(suggestions);
    } else {
      setTopicSuggestions([]);
    }
  };

  const handleTopicSuggestionClick = (suggestion: string) => {
    onTopicsChange([...selectedTopics, suggestion]);
    setTopicsInput('');
    setTopicSuggestions([]);
  };

  const handleTopicInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedInput = topicsInput.trim();
      if (trimmedInput) {
        if (!selectedTopics.includes(trimmedInput) && availableTopics.includes(trimmedInput)) {
            onTopicsChange([...selectedTopics, trimmedInput]);
        } else if (topicSuggestions.length > 0 ) {
          handleTopicSuggestionClick(topicSuggestions[0]); // Select first suggestion
        }
        setTopicsInput('');
        setTopicSuggestions([]);
      }
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    onTopicsChange(selectedTopics.filter(topic => topic !== topicToRemove));
  };

  const handleFieldOfResearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setFieldOfResearchInput(inputValue);
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      const suggestions = availableFieldsOfResearch.filter(field =>
        field.toLowerCase().includes(trimmedInput.toLowerCase()) && !selectedFieldsOfResearch.includes(field)
      );
      setFieldOfResearchSuggestions(suggestions);
    } else {
      setFieldOfResearchSuggestions([]);
    }
  };
    const handleFieldOfResearchSuggestionClick = (suggestion: string) => {
    onFieldOfResearchChange([...selectedFieldsOfResearch, suggestion]);
    setFieldOfResearchInput('');
    setFieldOfResearchSuggestions([]);
  };

  const handleFieldOfResearchInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
       const trimmedInput = fieldOfResearchInput.trim();
      if (trimmedInput) {
        if (!selectedFieldsOfResearch.includes(trimmedInput) && availableFieldsOfResearch.includes(trimmedInput)) {
            onFieldOfResearchChange([...selectedFieldsOfResearch, trimmedInput]);
        } else if(fieldOfResearchSuggestions.length > 0) {
           handleFieldOfResearchSuggestionClick(fieldOfResearchSuggestions[0]); // Select the first suggestion on Enter
        }
        setFieldOfResearchInput('');
        setFieldOfResearchSuggestions([]);
      }
    }
  };
  const handleRemoveFieldOfResearch = (fieldToRemove: string) => {
    onFieldOfResearchChange(selectedFieldsOfResearch.filter(field => field !== fieldToRemove));
  };

    const handleSubmissionDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    onSubmissionDateChange(date);
  };

  const handleRankChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
    onRankChange(event.target.value === "" ? null : event.target.value);
  };

  const handleSourceChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
    onSourceChange(event.target.value === "" ? null : event.target.value);
  };

  const handleAverageScoreChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
    onAverageScoreChange(event.target.value === "" ? null : event.target.value);
  };

    const handlePublisherInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onPublisherChange(event.target.value || null); // Directly update parent state
  };
  const handlePublisherEnter = (event: KeyboardEvent<HTMLInputElement> ) => {
      if(event.key === 'Enter'){
        onPublisherChange(event.currentTarget.value || null)
      }
  }

  return {
    topicsInput,
    topicSuggestions,
    fieldOfResearchInput,
    fieldOfResearchSuggestions,
    handleTopicInputChange,
    handleTopicSuggestionClick,
    handleTopicInputKeyDown,
    handleRemoveTopic,
      handleFieldOfResearchInputChange,
    handleFieldOfResearchSuggestionClick,
    handleFieldOfResearchInputKeyDown,
    handleRemoveFieldOfResearch,
      handleSubmissionDateInputChange,
    handleRankChangeInput,
    handleSourceChangeInput,
    handleAverageScoreChangeInput,
      handlePublisherInputChange, // Return the new handler
    handlePublisherEnter
  };
};

export default useSearchAdvanceForm;