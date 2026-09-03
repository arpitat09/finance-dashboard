/**
 * Reusable Page Container wrapper enforcing consistent max-width (1600px),
 * padding, horizontal margins, and vertical rhythm across all FINORA pages.
 */
export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`page-container animate-in ${className}`}>
      {children}
    </div>
  );
}
