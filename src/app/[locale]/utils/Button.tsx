import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'link'; // <<< THÊM 'link'
  size?: 'small' | 'medium' | 'large' | 'mini';
  rounded?: boolean;
  advanced?: boolean;
  advancedDivColor?: string;
  // className có thể được truyền từ ngoài vào để tùy chỉnh thêm
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  rounded = false,
  advanced = false,
  className, // className được truyền từ props
  advancedDivColor = '',
  ...props
}) => {
  // --- Base Styles ---
  // Bỏ rounded ở đây, sẽ áp dụng theo rounded prop hoặc variant
  const baseStyles = `focus:outline-none transition-colors duration-150 ease-in-out`;

  // --- Size Styles ---
  const sizeStyles = {
    // Điều chỉnh padding cho 'link' variant nếu cần
    mini: 'px-2 py-1 text-sm', // Giảm padding cho mini
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2 text-base font-semibold',
    large: 'px-6 py-3 text-lg font-semibold'
  };

  // --- Variant Styles ---
  // Thêm style cho 'link'
  const variantStyles = {
    primary: `bg-button text-button-text ${!rounded ? 'rounded-md' : ''} ring-secondary ring-1 hover:bg-button-hover disabled:bg-button-disabled disabled:text-button-text-disabled disabled:ring-gray-300`,
    secondary: `bg-button-secondary text-secondary ${!rounded ? 'rounded-md' : ''} ring-secondary ring-1 hover:bg-button-secondary-hover disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-gray-300`,
    danger: `bg-red-500 text-white ${!rounded ? 'rounded-md' : ''} ring-red-600 ring-1 hover:bg-red-600 disabled:bg-red-300 disabled:text-gray-100 disabled:ring-red-400`,
    link: `bg-transparent text-current hover:underline disabled:text-gray-400 disabled:no-underline p-0` // p-0 để loại bỏ padding mặc định của size nếu không muốn
  };

  // --- Rounded Styles ---
  // Áp dụng rounded-full nếu prop rounded là true, trừ khi là link (link không nên có bo tròn kiểu này)
  const roundedStyles = rounded && variant !== 'link' ? 'rounded-full' : (variant !== 'link' ? 'rounded-md' : '');


  // --- Advanced Styles (cho hiệu ứng ripple/glow) ---
  const advancedEffectStyles = advanced
    ? 'relative group' // group cần cho hiệu ứng con
    : '';

  // Kết hợp các style
  // Chú ý: className từ props nên được đặt cuối để có thể ghi đè
  const buttonStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${roundedStyles}
    ${advancedEffectStyles}
    ${className || ''}
  `;

  const renderButton = () => (
    <button className={buttonStyles.trim().replace(/\s\s+/g, ' ')} {...props}>
      {children}
    </button>
  );

  if (advanced && variant !== 'link') { // Hiệu ứng advanced không áp dụng cho link
    return (
      <div
        className={`${advancedDivColor || ''} relative overflow-hidden ${roundedStyles}`} // Sử dụng roundedStyles ở đây
      >
        <span className='pointer-events-none absolute inset-0 before:absolute before:-inset-1 before:origin-center before:scale-0 before:animate-pulse-ripple before:rounded-full before:bg-button before:opacity-10'></span>
        {renderButton()}
      </div>
    );
  } else {
    return renderButton();
  }
};

export default Button;