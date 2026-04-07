export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12,2 L13.8,9.2 L22,12 L13.8,14.8 L12,22 L10.2,14.8 L2,12 L10.2,9.2 Z"
        fill="currentColor"
      />
    </svg>
  )
}
