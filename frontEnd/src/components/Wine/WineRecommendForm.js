import { useState } from "react";
import axios from "axios";
import { tasteOptions, aromaOptions } from "../../Data/options";

/* import  */
import MultiSelectButtons from "./MultiSelectButtons";
import SliderInput from "./SliderInput";

/* 스타일 */
import "./WineRecommendForm.css";

export default function WineRecommendForm({ onRecommend }) {
    // 상태 관리
    const [taste, setTaste] = useState([]);
    const [aroma, setAroma] = useState([]);
    const [finish, setFinish] = useState("");
    const [alcohol, setAlcohol] = useState("");
    const [body, setBody] = useState(5);
    const [tannin, setTannin] = useState(5);
    const [sweetness, setSweetness] = useState(3);
    const [acidity, setAcidity] = useState(6);
    const [budget, setBudget] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userInput = {
            taste: taste.join(", "),
            smell: aroma.join(", "),
            finish:
                finish === "short" ? "짧은 편" :
                finish === "medium" ? "중간 정도" :
                finish === "long" ? "긴 편" :
                finish === "very-long" ? "매우 긴 편" : "",
            alcohol_content: alcohol ? alcohol + "%" : "",
            body: String(body),
            tannin: String(tannin),
            sweetness: String(sweetness),
            sourness: String(acidity),  // acidity → sourness
            price: budget ? `${budget}원` : "상관없음"
        };
        
        console.log("userInput ::", userInput);
        try {
            const response = await axios.post("http://localhost:8000/recommend", userInput);
            console.log("response ::", response.data.recommendation);
            if (onRecommend) onRecommend(response.data.recommendation);
        } catch (error) {
            alert("추천 요청 실패!");
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h1>🍷 AI 와인 추천</h1>
                <p>취향의 와인을 찾아드립니다</p>
            </div>
            <div className="form-section">
                <h2>와인 취향 설정</h2>
                <form onSubmit={handleSubmit} id="wineForm">
                    <MultiSelectButtons
                        label="맛은 어떤가요? (다중 선택 가능)"
                        options={tasteOptions}
                        selected={taste}
                        onChange={setTaste}
                    />
                    <MultiSelectButtons
                        label="향은 어떤가요? (다중 선택 가능)"
                        options={aromaOptions}
                        selected={aroma}
                        onChange={setAroma}
                    />

                    <div className="form-row">
                        <div className="form-group">
                        <label htmlFor="finish">여운은 어떤가요?</label>
                        <select id="finish" value={finish} onChange={e => setFinish(e.target.value)}>
                            <option value="">모름</option>
                            <option value="short">짧은 편</option>
                            <option value="medium">중간 정도</option>
                            <option value="long">긴 편</option>
                            <option value="very-long">매우 긴 편</option>
                        </select>
                        </div>
                        <div className="form-group">
                        <label htmlFor="alcohol">도수는 몇 % 인가요?</label>
                        <input
                            type="number"
                            id="alcohol"
                            min="0"
                            max="20"
                            step="1"
                            placeholder="예: 13"
                            value={alcohol}
                            onChange={e => setAlcohol(e.target.value)}
                        />
                        </div>
                    </div>

                    <SliderInput label="바디 (1~10)" id="body" min={1} max={10} value={body} onChange={setBody} left="라이트" right="풀 바디" />
                    <SliderInput label="타닌 (1~10)" id="tannin" min={1} max={10} value={tannin} onChange={setTannin} left="부드러운" right="강한" />
                    <SliderInput label="당도 (1~10)" id="sweetness" min={1} max={10} value={sweetness} onChange={setSweetness} left="드라이" right="스위트" />
                    <SliderInput label="산미 (1~10)" id="acidity" min={1} max={10} value={acidity} onChange={setAcidity} left="부드러운" right="강한 산미" />

                    <div className="form-group">
                        <label htmlFor="budget">예산은 얼마인가요?</label>
                        <input
                        type="number"
                        id="budget"
                        min="0"
                        placeholder="예: 50000 (원)"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="recommend-btn">
                        🤖 AI 추천 받기
                    </button>
                </form>
            </div>
        </div>
    );
}
