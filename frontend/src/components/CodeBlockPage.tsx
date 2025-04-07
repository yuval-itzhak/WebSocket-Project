import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import {io} from 'socket.io-client';
import { javascript } from "@codemirror/lang-javascript";
import { autocompletion } from '@codemirror/autocomplete';
import  CodeMirror  from '@uiw/react-codemirror';
// import { linter } from "@codemirror/lint";
// import { basicSetup } from "@codemirror/basic-setup";


const CodeBlockPage = () => {
    const { room_id } = useParams<{room_id:string}>();
    const [code, setCode] = useState('');
    const [role, setRole] = useState<string>('student');
    const [solution, setSolution] = useState<string>('Enter solution');
    const [studentCount, setStudentCount] = useState<number>(0);
    const socketRef = useRef<any>(null);

    useEffect(() => { 
        socketRef.current = io('http://localhost:5003');

        socketRef.current.emit('joinRoom', room_id);  
        socketRef.current.on('role', (role: string) => setRole(role));
        socketRef.current.on('codeUpdate', (updatedCode: string) => setCode(updatedCode));
        socketRef.current.on('studentCount', (count: number) => setStudentCount(count));
        socketRef.current.on('mentorLeft', () => {
          window.location.href = '/'; //redirect to lobby if mentor leaves
        });

        return () => {
            socketRef.current.disconnect();
          };

    }, []);

    const handleCodeChange = (updatedCode : string) => {
        setCode(updatedCode);
        if (socketRef.current) {
            socketRef.current.emit('codeUpdate', room_id, updatedCode);
        }
    };

    const isSolutionCorrect = code === solution;

    return (
        <div>
          <h1>Code Block</h1>
          <p>Role: {role}</p>
          <p>Students in Room: {studentCount}</p>
    
          <CodeMirror
            value={code}
            height="300px"
            extensions={[javascript(),autocompletion()]}
            editable={role !== 'mentor'}
            onChange={handleCodeChange}
            />
    
          {isSolutionCorrect && <div style={{ fontSize: '50px' }}>😊</div>}
        </div>
    );

};

export default CodeBlockPage;

      


