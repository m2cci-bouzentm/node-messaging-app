
interface CloseIconProps {
  clickEventHandler: ()=>void;
}

const CloseIcon = ({clickEventHandler}: CloseIconProps) => {
  return (
    <div
      onClick={clickEventHandler}
      className="relative w-4 h-4 close-chat-btn cursor-pointer z-10 hover:scale-105 hover:shadow-lg transition-all"
    >
      <div className="absolute top-1/2 left-1/2 w-6 h-[2px] bg-main transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
      <div className="absolute top-1/2 left-1/2 w-6 h-[2px] bg-main transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
    </div>
  );
};

export default CloseIcon;
