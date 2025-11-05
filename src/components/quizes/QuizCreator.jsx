import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const optionsStyle={display:"flex",flexDirection:"column",gap:"0.5rem",justifyContent:"center",width:"100%",height:"auto"};
const optionRow={display:"flex",flexDirection:"row",alignItems:"center",width:"100%",fontSize:"0.5rem",gap:"0.4rem"};
const buttonStyle={marginTop:"1rem", marginBottom: '1rem', padding:"0.6rem 1.2rem",border:"none",borderRadius:"10px",background:"linear-gradient(135deg,#00ff99,#007755)",color:"#fff",fontSize:"1rem",boxShadow:"0 0 10px #00ff99aa",transition:"0.2s"};

export default function QuizCreator({questions,title}){
  const [answers,setAnswers]=useState(Array(questions.length).fill(null));
  const [score,setScore]=useState(null);

  const handleSelect=(qi,ai)=>{
    const newAns=[...answers];
    newAns[qi]=ai;
    setAnswers(newAns);
  };

  const evaluate=()=>{
    let correct=0;
    questions.forEach((q,i)=>{ if(answers[i]===q.correct) correct++; });
    setScore(Math.round((correct/questions.length)*100));
  };

  return(
    <div className="quiz-scroller">
      <h1>{title}</h1>
      {questions.map((q,idx)=>(
        <div key={idx} className="glass-box">
          <label style={{fontWeight:"bold"}}>{idx+1}. {q.question}</label>
          <div style={optionsStyle}>
            {q.answers.map((ans,ai)=>(
              <div key={ai} style={optionRow}>
                <input type="radio" name={`q-${idx}`} checked={answers[idx]===ai} onChange={()=>handleSelect(idx,ai)} style={{accentColor:"#00ff99"}}/>
                <label style={{textAlign:"left"}}>{ans}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button style={buttonStyle} onClick={evaluate}>Evaluate</button>
      {score!==null && (
        <div style={{width:"70",margin:"1rem auto", display:"flex", flexDirection:"row", gap:'1rem', justifyContent:"center", alignItems:"center"}}>
            <label style={{fontSize:'1.8rem', }}>Your Test Score: </label>
          <CircularProgressbar value={score} text={`${score}%`} styles={buildStyles({textColor:"#00ff99",pathColor:"#00ff99",trailColor:"#003322"})}/>
        </div>
      )}
    </div>
  );
}

