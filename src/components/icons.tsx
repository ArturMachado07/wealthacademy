// Conjunto de ícones do site — desenhados à mão (sem dependência externa),
// estilo linha fina consistente com o traço já usado no ícone do WhatsApp.
// Todos aceitam className (cor via currentColor, tamanho via w-/h- Tailwind).
// Não usamos nenhuma biblioteca (lucide, heroicons, etc.) porque o ambiente
// de build não tem acesso à npm registry para validar a instalação — este
// conjunto próprio evita essa dependência sem perder consistência visual.

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l1.9-1.9c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19.5c0 .6-.4 1-1 1C10.7 20.5 3.5 13.3 3.5 4.5c0-.6.4-1 1-1H7.6c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1.1L6.6 10.8Z" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M4 6.5l8 6.5 8-6.5" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21.5s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5v6" />
      <circle cx="8" cy="7.3" r="0.4" fill="currentColor" stroke="none" />
      <path d="M12 16.5v-3.5c0-1.4 1-2.5 2.3-2.5 1.3 0 2.2 1 2.2 2.5v3.5" />
      <path d="M12 10.5v6" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.3v5.4l4.7-2.7-4.7-2.7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MessageCircleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M21 11.5a8.5 8.5 0 1 1-4.2-7.3" />
      <path d="M12 3a8.5 8.5 0 0 1 8.5 8.5c0 1-.2 2-.6 2.9L21 20l-5.6-1.4c-1 .5-2.2.7-3.4.7" />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 11.2 20 4l-6.9 15.5-2.6-6-6-2.3Z" />
      <path d="M13.1 12.6 20 4" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="15" cy="17" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Único ícone com forma de marca real (WhatsApp) — mantido preciso porque é
// um logótipo reconhecível, ao contrário dos restantes que são genéricos.
export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.702 4.607 1.912 6.47L4 29l7.723-1.877A11.94 11.94 0 0 0 16 27c6.628 0 12-5.373 12-12S22.629 3 16.001 3Zm0 21.75c-1.94 0-3.75-.53-5.303-1.454l-.38-.226-4.58 1.113 1.15-4.46-.248-.393A9.71 9.71 0 0 1 5.25 15c0-5.937 4.813-10.75 10.751-10.75 5.937 0 10.75 4.813 10.75 10.75S21.938 24.75 16 24.75Zm5.89-8.07c-.322-.161-1.904-.94-2.2-1.047-.295-.108-.51-.161-.724.161-.215.322-.833 1.047-1.021 1.262-.188.215-.376.242-.698.081-.322-.161-1.36-.501-2.591-1.598-.958-.854-1.605-1.909-1.793-2.231-.188-.322-.02-.496.141-.656.145-.144.322-.376.483-.564.161-.188.215-.322.322-.537.108-.215.054-.403-.027-.564-.081-.161-.724-1.745-.992-2.39-.261-.626-.526-.541-.724-.551-.188-.009-.403-.011-.618-.011-.215 0-.564.081-.86.403-.295.322-1.128 1.102-1.128 2.687 0 1.585 1.155 3.117 1.316 3.332.161.215 2.273 3.47 5.507 4.868.77.332 1.37.531 1.838.679.772.246 1.475.211 2.03.128.619-.092 1.904-.778 2.173-1.529.268-.752.268-1.396.188-1.529-.081-.134-.295-.215-.617-.376Z" />
    </svg>
  );
}
