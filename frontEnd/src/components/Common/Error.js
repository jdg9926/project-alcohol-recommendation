import "./Error.css";

const DefaultError = {
  network: {
    icon: "🌐",
    // img: ,
    message: "네트워크 연결에 문제가 있어요. 인터넷을 확인해 주세요.",
  },
  notFound: {
    icon: "🔍",
    message: "데이터를 찾을 수 없습니다.",
  },
  server: {
    icon: "💥",
    message: "서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
  },
  empty: {
    icon: "😿",
    message: "표시할 데이터가 없습니다.",
  },
  default: {
    icon: "⚠️",
    message: "알 수 없는 오류가 발생했어요.",
  },
};

const Error = ({ type = "default", detail }) => {
  const { icon, message } = DefaultError[type] || DefaultError.default;

  return (
    <div className="error-container">
      <span className="error-icon" aria-label="error">{icon}</span>
      <p className="error-message">{message}</p>
      {detail && <pre className="error-detail">{detail}</pre>}
    </div>
  );
};

export default Error;
