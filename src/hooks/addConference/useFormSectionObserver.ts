// src/hooks/addConference/useFormSectionObserver.ts
'use client';

import { useState, useEffect, useRef } from 'react';

interface Section {
  id: string;
  name: string;
  validator: (props: any) => boolean;
}

export const useFormSectionObserver = (sections: Section[]) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Logic của IntersectionObserver được giữ nguyên
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );

    const currentObserver = observer.current;
    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) currentObserver.observe(el);
    });

    return () => currentObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map(s => s.id).join(',')]); // Phụ thuộc vào ID của các section

  return activeSection;
};