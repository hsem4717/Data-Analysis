// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

        // Trigger real-time analysis after adding a new review
        axios.post('http://localhost:8000/analyze_data', { book_name: bookName, score: limitedScore, content }, { responseType: 'arraybuffer' })
  .then(analysisResponse => {
    const imgData = new Uint8Array(analysisResponse.data);
    const blob = new Blob([imgData], { type: 'image/png' });
    const dataUrl = URL.createObjectURL(blob);
    setWordCloudUrl(dataUrl);

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

      <h2>책별 평균 점수</h2>
      <ul>
        {Object.entries(averageScores).map(([book, avgScore]) => (
          <li key={book}>
            <strong>{book}</strong> - 평균 점수: {avgScore.toFixed(1)}
          </li>
        ))}
      </ul>

      <h2>워드클라우드</h2>
      {wordCloudUrl && <img src={wordCloudUrl} alt="Word Cloud" />}
    </div>
  );
}

export default App;
