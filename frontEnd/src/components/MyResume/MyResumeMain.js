import { useEffect, useState } from "react";
import axios from "axios";

import { BASE_URL } from "../../api/baseUrl";

import UKAMainLogo from '../../images/UKAMainLogo.png';
import wineMainLogo from '../../images/wineMainLogo.png';
import face from '../../images/face.jpg';


import "./MyResumeMain.css";

const skills = [
    {
        category: "Frontend",
        items: [
            { name: "React", level: 95 },
            { name: "JavaScript", level: 95 },
            { name: "Vue.js", level: 90 },
            { name: "HTML/CSS", level: 85 },
        ],
    },
    {
        category: "Backend",
        items: [
            { name: "Java", level: 85 },
            { name: "Spring boot", level: 80 },
            { name: "Node.js", level: 80 },
            { name: "Python", level: 60 },
        ],
    },
    {
        category: "Database",
        items: [
            { name: "MySQL", level: 85 },
            { name: "OracleDB", level: 85 },
        ],
    },
    {
        category: "DevOps & Tools",
        items: [
            { name: "Git", level: 80 },
            { name: "AWS", level: 75 },
            { name: "Jenkins", level: 70 },
        ],
    },
];

const projects = [
    {
        image: UKAMainLogo,
        title: "UKA 센터 (유기동물센터) 25.06.09 ~ 25.07.04",
        description: "팀 프로젝트로 만들었으며 React와 Java를 활용하여 유기동물 입양 센터 페이지를 만들었습니다.",
        techStack: ["React", "Java", "Spring boot", "JPA", "MySQL"],
        live: "#",
        github: "https://github.com/hms1218/TeamProject-UKA",
    },
    {
        image: "",
        title: "데이터 분석 대시보드",
        description: "팀 프로젝트로 만들었으며 React Native를 활용하여 OTT Movie 리뷰 사이트를 만들었습니다.",
        techStack: ["React", "React Native", "Spring boot", "Java", "JPA", "MySQL" ],
        live: "#",
        github: "#",
    },
    {
        image: wineMainLogo,
        title: "AI가 말아주는 와인 추천  25.07.14 ~ 진행중",
        description: "개인 프로젝트로 만들었으며 Python로 진행하여 Open API AI 를 활용한 AI 와인 추천 기능을 구현했습니다.",
        techStack: ["Python", "Java", "Spring boot", "JPA", "MySQL"],
        live: "http://project-alcohol-recommendation.s3-website.ap-northeast-2.amazonaws.com/",
        github: "https://github.com/jdg9926/project-alcohol-recommendation",
    },
];

const experiences = [
    {
        title: "한화생명 보험코어S 구축 TF 대응 개발",
        company: "한화생명",
        period: "2021 09월 - 2022 11월",
        description: [
            "금융·보험 웹·앱 SI 시스템의 AS-IS/TO-BE 분석 및 대응 개발",
            "AS-IS 분석: 현행 업무 프로세스·시스템 환경 파악, 사용자 경험 및 불편사항 검토, 핵심 문제점 도출",
            "TO-BE 분석: 개선 목표 및 전략 수립, 프로세스 변경 및 목표 달성 계획 수립",
            "Java, JSP, Vue.js, Ajax 등 한화생명 앱 개발·개선",
        ],
    },
    {
        title: "소프트웨어개발",
        company: "현대오토에버/에이치앤웍스",
        period: "2019년 09월 - 2021년 08월",
        description: [
            "통합검색기능강화",
            "2019-09-01 ~ 2020-06-01",
            "기존 사용하던 서비스 개편으로 인해 (MiPlatform --> NexacroPlatform 14)",
            "통합검색기능 개선(강화) 진행",
            "",
            "SW업데이트시스템구축",
            "2020-06-01 ~ 2020-11-01",
            "기존 사용하던 서비스 개편으로 인해 (MiPlatform --> NexacroPlatform 14)",
            "개편 시스템 구축",
            "",
            "고장진단정보관리",
            "2020-11-01 ~ 2021-08-01",
            "차량 정보를 이용, 빅데이터를 통한 고장진단 데이터 관리 화면 구축",
        ],
    },
];

const certifications = [
    {
        title: "AWS 클라우드를 활용한 풀스택(React, SpringBoot) 개발",
        org: "코리아IT아카데미",
        date: "2025.02 - 2025.08",
    },
    {
        title: "응용 SW 엔지니어링 과정",
        org: "미래능력개발교육원",
        date: "2018.11 - 2019.08",
    },
    {
        title: "기계공학과 학사 졸업",
        org: "명지전문대학교",
        date: "2014.03 - 2019.02",
    },
];

const FLOATING_ICONS = [
    "💻", "🚀", "⚡", "🌐", "🧑‍💻", "🛠️", "🎨", "📱", "☁️", "🔒", "📊", "🖥️", "🧩", "🗄️", "📦", "🤖",
    "💻", "🚀", "⚡", "🌐", "🧑‍💻", "🛠️", "🎨", "📱", "☁️", "🔒", "📊", "🖥️", "🧩", "🗄️", "📦", "🤖",
];

function getRandomPosition(index) {
    const top = Math.floor(Math.random() * 85) + 5;
    const left = Math.floor(Math.random() * 85) + 5;
    const delay = (Math.random() * 5).toFixed(1);
    return {
        top: `${top}%`,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        fontSize: `${Math.floor(Math.random() * 40) + 30}px`,
    };
}

export default function MyResumeMain() {
    // 1. 이메일 입력 상태 추가
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // 2. 이메일 전송 핸들러
    const handleSendResume = async (e) => {
        e.preventDefault();
        setSending(true);
        setMessage("");
        setIsError(false);
        try {
            const res = await axios.post(`${BASE_URL}:8888/api/users/send-resume`, { email });
            if (res.data.success) {
                setMessage("이메일로 이력서가 전송되었습니다.");
                setIsError(false);
            } else {
                setMessage("전송 실패. 다시 시도해주세요.");
                setIsError(true);
            }
        } catch (err) {
            setMessage("오류가 발생했습니다.");
            setIsError(true);
        }
        setSending(false);
    };

    // 스킬바 애니메이션
    useEffect(() => {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        });
    }, []);

    return (
        <>
            <div className="floating-elements">
                {FLOATING_ICONS.map((icon, i) => (
                    <div
                        key={i}
                        className="floating-element"
                        style={getRandomPosition(i)}
                    >
                        {icon}
                    </div>
                ))}
            </div>
            <div className="container">

                {/* 헤더 */}
                <header className="header">
                    <img className="profile-img" src={face} alt="프로필 이미지" />
                    <h1 className="name">박세현</h1>
                    <p className="title">Full Stack Developer | Backend & Frontend</p>
                    <div className="contact-info">
                        <a href="jdg9926@naver.com" className="contact-item">📧 jdg9926@naver.com</a>
                        <a href="tel:+82-10-9041-7013" className="contact-item">📱 010-9041-7013</a>
                        <a href="https://github.com/jdg9926" className="contact-item" target="_blank" rel="noopener noreferrer">🐱 GitHub</a>
                        {/* <a href="https://linkedin.com/in/yourprofile" className="contact-item" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a> */}
                    </div>
                </header>

                {/* 자기소개 */}
                <section className="section">
                    <h2 className="section-title">👋 About Me</h2>
                    <p style={{ fontSize: '1.1em', lineHeight: 1.8, color: '#555' }}>
                        안녕하세요! 3년차 개발자입니다. 
                        백엔드와 프론트엔드 개발 모두에 열정을 가지고 있으며, 
                        사용자 중심의 웹 애플리케이션을 만드는 것을 좋아합니다. 
                        새로운 기술을 배우고 적용하는 것에 즐거움을 느끼며, 
                        팀과의 협업을 통해 더 나은 결과를 만들어내는 것을 중요하게 생각합니다.
                    </p>
                </section>

                {/* 기술 스택 */}
                <section className="section">
                    <h2 className="section-title">💻 Tech Skills</h2>
                    <div className="skills-grid">
                        {skills.map((category, i) => (
                            <div className="skill-category" key={i}>
                                <h3>{category.category}</h3>
                                {category.items.map(item => (
                                    <div className="skill-item" key={item.name}>
                                        <span>{item.name}</span>
                                        <div className="skill-bar">
                                            <div className="skill-progress" data-width={`${item.level}%`} style={{ width: `${item.level}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 프로젝트 */}
                <section className="section">
                    <h2 className="section-title">🚀 Projects</h2>
                    <div className="project-grid">
                        {projects.map((proj, i) => (
                            <div className="project-card" key={i}>
                                <div className="project-image">
                                {/* MainLogo는 import로 실제 url string이 할당됨 */}
                                {typeof proj.image === "string" && proj.image.includes(".png") ? (
                                    <img
                                    src={proj.image}
                                    alt={proj.title}
                                    style={{
                                        width: "90%",
                                        height: "90%",
                                    }}
                                    />
                                ) : (
                                    proj.image
                                )}
                                </div>
                                <div className="project-content">
                                    <h3 className="project-title">{proj.title}</h3>
                                    <p className="project-description">{proj.description}</p>
                                    <div className="tech-stack">
                                        {proj.techStack.map((tech, j) => (
                                            <span className="tech-tag" key={j}>{tech}</span>
                                        ))}
                                    </div>
                                    <div className="project-links">
                                        <a href={proj.live} className="project-link btn-primary" target="_blank" rel="noopener noreferrer">Live Demo</a>
                                        <a href={proj.github} className="project-link btn-secondary" target="_blank" rel="noopener noreferrer">GitHub</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 경력 */}
                <section className="section">
                    <h2 className="section-title">💼 Experience</h2>
                    <div className="experience-timeline">
                        {experiences.map((exp, i) => (
                            <div className="experience-item" key={i}>
                                <h3 className="experience-title">{exp.title}</h3>
                                <p className="experience-company">{exp.company}</p>
                                <p className="experience-period">{exp.period}</p>
                                <p className="experience-description">
                                    {exp.description.map((desc, idx) => (
                                        <span key={idx}>{desc}<br /></span>
                                    ))}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 교육/자격증 */}
                <section className="section">
                    <h2 className="section-title">🎓 Education</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                        {certifications.map((cert, i) => (
                            <div key={i} style={{ background: 'rgba(102, 126, 234, 0.1)', padding: 20, borderRadius: 15 }}>
                                <h3 style={{ color: '#667eea', marginBottom: 10 }}>{cert.title}</h3>
                                <p style={{ color: '#666', marginBottom: 5 }}>{cert.org}</p>
                                <p style={{ color: '#888', fontSize: '0.9em' }}>{cert.date}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="section">
                    <h2 className="section-title">📧 이력서 이메일로 받기</h2>
                    <form className="resume-email-form" onSubmit={handleSendResume}>
                        <input
                            className="resume-email-input"
                            type="email"
                            placeholder="이메일 주소 입력"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <button
                            className="resume-email-btn"
                            type="submit"
                            disabled={sending}
                        >
                            {sending ? "전송중..." : "발송하기"}
                        </button>
                    </form>
                    <p className={`resume-email-message ${isError ? "error" : "success"}`}>{message}</p>
                </section>
            </div>
        </>

    );
}
