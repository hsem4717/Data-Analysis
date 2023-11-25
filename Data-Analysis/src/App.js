// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [bookName, setBookName] = useState('');
  const [score, setScore] = useState(0);
  const [content, setContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [averageScores, setAverageScores] = useState({});

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

        // Trigger real-time analysis after adding a new review
        axios.post('http://localhost:8000/analyze_data', { book_name: bookName, score: limitedScore, content })
          .then(analysisResponse => {
            console.log('Real-time analysis result:', analysisResponse.data);
            // Update the state with analysis result
            setAnalysisResult(analysisResponse.data);
          })
          .catch(error => console.error('Error performing real-time analysis:', error));

        // Update average scores after adding a new review
        axios.get('http://localhost:8000/average_scores')
          .then(response => setAverageScores(response.data))
          .catch(error => console.error('Error fetching average scores:', error));
      })
      .catch(error => console.error('Error adding review:', error));
  };

  return (
    <div>
      <h1>도서 리뷰</h1>
      <div>
        <label>책 이름:</label>
        <input type="text" value={bookName} onChange={(e) => setBookName(e.target.value)} />
      </div>
      <div>
        <label>리뷰 점수:</label>
        <input type="number" value={score} min="1" max="5" onChange={(e) => setScore(e.target.value)} />
      </div>
      <div>
        <label>리뷰 내용:</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <button onClick={addReview}>리뷰 추가</button>

      {analysisResult && (
        <div>
          <h2>실시간 분석 결과</h2>
          <p>평균 점수: {analysisResult.average_score}</p>
          <p>리뷰 수: {analysisResult.review_count}</p>
        </div>
      )}

      <h2>책별 평균 점수</h2>
      <ul>
        {Object.entries(averageScores).map(([book, avgScore]) => (
          <li key={book}>
            <strong>{book}</strong> - 평균 점수: {avgScore}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;