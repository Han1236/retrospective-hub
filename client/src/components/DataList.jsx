import React from 'react';
import './DataList.css'; // CSS 파일 임포트 (선택 사항)

function DataList({ data }) { // props로 데이터 배열을 받음
  if (!data || data.length === 0) {
    return <p>기록된 데이터가 없습니다.</p>;
  }

  return (
    <div className="data-list">
      <h2>기록된 데이터 목록</h2>
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>항목</th>
            <th>값</th>
            {/* <th>기록 시간 (참고용)</th> */}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}> {/* 고유 key 값으로 item.id 사용 */}
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>{item.value}</td>
              {/* <td>{new Date(item.createdAt).toLocaleString()}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataList;