import axios from 'axios';
import { useState } from 'react';

import { BASE_URL } from '../../api/baseUrl';

const WineRecommendation = () => {
  const [formData, setFormData] = useState({
    taste: '풍부하고 진한',
    smell: '과일 향이 풍부한',
    finish: '긴 편',
    alcohol_content: '13%',
    body: '중간',
    tannin: '중간',
    sweetness: '약간 달콤한',
    sourness: '적당히 시큼한',
    price: '상관없음',
  });

  const [recommendation, setRecommendation] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRecommendation = async () => {
    try {
      const response = await axios.post(`${BASE_URL}:8000/recommend`, formData);
      setRecommendation(response.data.recommendation);
    } catch (error) {
      console.error(error);
      setRecommendation('추천을 불러오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <input name="taste" value={formData.taste} onChange={handleChange} placeholder="맛" />
      <input name="smell" value={formData.smell} onChange={handleChange} placeholder="향" />
      <input name="finish" value={formData.finish} onChange={handleChange} placeholder="여운" />
      <input name="alcohol_content" value={formData.alcohol_content} onChange={handleChange} placeholder="도수" />
      <input name="body" value={formData.body} onChange={handleChange} placeholder="바디" />
      <input name="tannin" value={formData.tannin} onChange={handleChange} placeholder="타닌" />
      <input name="sweetness" value={formData.sweetness} onChange={handleChange} placeholder="당도" />
      <input name="sourness" value={formData.sourness} onChange={handleChange} placeholder="산미" />
      <input name="price" value={formData.price} onChange={handleChange} placeholder="가격" />

      <button onClick={getRecommendation}>와인 추천 받기</button>

      {recommendation && (
        <div>
          <h3>추천 결과</h3>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default WineRecommendation;
