interface DisplayRowProps {
  label: string;
  value: any;
  className?: string;
}
export default function DisplayRow({
  label,
  value,
  className,
}: DisplayRowProps) {
  if (value === null || value === undefined) return null;
  let displayValue = value;
  if (label === 'lastUpdated') {
    const [datePart, timePart] = value.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split(':');
    displayValue = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    ).toString();
  }
  return (
    <div key={label} className={`mb-3 ${className}`}>
      <div className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
        {label}
      </div>
      <div className='mt-1 text-base text-gray-900'>{displayValue}</div>
    </div>
  );
}
