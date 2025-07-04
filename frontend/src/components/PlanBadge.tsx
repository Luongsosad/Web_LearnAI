const PlanBadge = ({ level }: { level: number }) => {
  let text = 'Free';
  let color = 'border-t-gray-600';

  if (level === 2) {
    text = 'Basic';
    color = 'border-t-yellow-500';
  } else if (level === 3) {
    text = 'Pro';
    color = 'border-t-green-500';
  }

  return (
    <div
      className={`absolute top-0 right-0 w-0 h-0 border-t-[45px] border-l-[45px] border-l-transparent z-10 ${color}`}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        borderTopRightRadius: '12px',
      }}
    >
      <div
        className={`absolute -top-[35px] right-[-5px] rotate-[45deg] text-[11px] w-[40px] text-center text-white font-bold tracking-widest`}
      >
        {text}
      </div>
    </div>
  );
};

export default PlanBadge;
