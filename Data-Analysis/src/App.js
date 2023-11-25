// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [bookName, setBookName] = useState('');
  const [score, setScore] = useState(0);
  const [content, setContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [averageScores, setAverageScores] = useState({});
  const [wordCloudUrl, setWordCloudUrl] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/average_scores')
      .then(response => setAverageScores(response.data))
      .catch(error => console.error('Error fetching average scores:', error));
  }, []);

  const addReview = () => {
    const limitedScore = Math.max(1, Math.min(5, score));

    axios.post('http://localhost:8000/add_review', { book_name: bookName, score: limitedScore, content })
      .then(response => {
        console.log(response.data.message);
        setBookName('');
        setScore(0);
        setContent('');

        axios.post('http://localhost:8000/analyze_data', { book_name: bookName, score: limitedScore, content }, { responseType: 'arraybuffer' })
          .then(analysisResponse => {
            const imgData = new Uint8Array(analysisResponse.data);
            const blob = new Blob([imgData], { type: 'image/png' });
            const dataUrl = URL.createObjectURL(blob);
            setWordCloudUrl(dataUrl);

            setAnalysisResult(analysisResponse.data);
          })
          .catch(error => console.error('Error performing real-time analysis:', error));

        axios.get('http://localhost:8000/average_scores')
          .then(response => setAverageScores(response.data))
          .catch(error => console.error('Error fetching average scores:', error));
      })
      .catch(error => console.error('Error adding review:', error));
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">도서 리뷰</h1>
      <div className="mb-3">
        <label className="form-label">책 이름:</label>
        <input type="text" className="form-control" value={bookName} onChange={(e) => setBookName(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">리뷰 점수:</label>
        <input type="number" className="form-control" value={score} min="1" max="5" onChange={(e) => setScore(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">리뷰 내용:</label>
        <textarea className="form-control" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={addReview}>리뷰 추가</button>

      <h2 className="mt-4">책별 평균 점수와 리뷰 수</h2>
      <ul className="list-group">
        {Object.entries(averageScores).map(([book, data]) => (
          <li key={book} className="list-group-item">
            <strong>{book}</strong>
            - 평균 점수: {data.average_score.toFixed(1)}, 
            리뷰 수: {data.review_count}
          </li>
        ))}
      </ul>

      <h2 className="mt-4">리뷰중 가장 많이 사용된 단어</h2>
      {wordCloudUrl && <img src={wordCloudUrl} alt="Word Cloud" className="img-fluid" />}
    </div>
  );
}

export default App;
