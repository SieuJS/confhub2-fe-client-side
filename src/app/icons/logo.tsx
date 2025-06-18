import Image from "next/image"

function LogoIcon() {
  return (
    <Image 
      src='/icon-512x512-removebg-preview.png' 
      alt='logo' 
      width={80} 
      height={80} 
    />
  )
}

export default LogoIcon
