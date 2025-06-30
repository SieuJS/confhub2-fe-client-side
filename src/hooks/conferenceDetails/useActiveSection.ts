// hooks/useActiveSection.ts
import { useEffect, useState } from 'react';

interface UseActiveSectionProps {
  navRef: React.RefObject<HTMLElement>;
  updatedSections: string[];
}
const useActiveSection = ({ navRef, updatedSections }: UseActiveSectionProps) => {
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        const handleScroll = () => {
            if (!navRef.current) return;

            let currentSection = '';
            for (const sectionId of updatedSections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const navElement = navRef.current;
                    const navHeight = navElement ? navElement.offsetHeight : 0;
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= navHeight + 112) {
                        currentSection = sectionId;
                    }
                }
            }
            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [navRef, updatedSections]); //navRef is stable,  updatedSections is a dependency

    return { activeSection, setActiveSection }; // Return both the value and the setter
};

export default useActiveSection;

// //Phương án 2
// // hooks/useActiveSection.ts
// import { useEffect, useState } from 'react';

// interface UseActiveSectionProps {
//   navRef: React.RefObject<HTMLElement>;
//   updatedSections: string[];
// }

// const useActiveSection = ({ navRef, updatedSections }: UseActiveSectionProps) => {
//     // Khởi tạo activeSection với section đầu tiên để trang vừa tải xong đã có tab được highlight
//     const [activeSection, setActiveSection] = useState<string>(updatedSections[0] || '');

//     useEffect(() => {
//         const handleScroll = () => {
//             if (!navRef.current) return;

//             const navHeight = navRef.current.offsetHeight;
//             // Thêm một khoảng đệm nhỏ để việc highlight chính xác hơn
//             const scrollOffset = navHeight + 112; 

//             let newActiveSection = '';

//             // Duyệt qua các section để tìm section nào đang ở trên cùng
//             for (const sectionId of updatedSections) {
//                 const section = document.getElementById(sectionId);
//                 if (section) {
//                     const sectionTop = section.getBoundingClientRect().top;
                    
//                     // Nếu đỉnh của section nằm phía trên offset của chúng ta
//                     // thì nó là ứng cử viên cho section đang active
//                     if (sectionTop <= scrollOffset) {
//                         newActiveSection = sectionId;
//                     } else {
//                         // Nếu gặp section đầu tiên nằm hoàn toàn bên dưới offset,
//                         // thì section trước đó chính là section active.
//                         // Chúng ta có thể dừng vòng lặp để tối ưu.
//                         break;
//                     }
//                 }
//             }
            
//             // Nếu không có section nào ở trên, có thể người dùng đang ở trên cùng,
//             // thì active section đầu tiên.
//             if (newActiveSection === '' && updatedSections.length > 0) {
//                 newActiveSection = updatedSections[0];
//             }

//             setActiveSection(newActiveSection);
//         };

//         // Gọi handleScroll một lần lúc đầu để set trạng thái ban đầu
//         handleScroll();

//         window.addEventListener('scroll', handleScroll, { passive: true });

//         return () => {
//             window.removeEventListener('scroll', handleScroll);
//         };
//     }, [navRef, updatedSections]);

//     return { activeSection, setActiveSection };
// };

// export default useActiveSection;

