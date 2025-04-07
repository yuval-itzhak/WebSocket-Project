import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import {io} from 'socket.io-client';
import { javascript } from "@codemirror/lang-javascript";
import { autocompletion } from '@codemirror/autocomplete';
import  CodeMirror  from '@uiw/react-codemirror';
// import { linter } from "@codemirror/lint";
// import { basicSetup } from "@codemirror/basic-setup";



const CodeBlockPage = () => {
    const { id } = useParams<{id:string}>();
    const [code, setCode] = useState('');
    const [role, setRole] = useState<string>('student');
    const [solution, setSolution] = useState<string>('Enter solution');
    const [studentCount, setStudentCount] = useState<number>(0);
    const socket = io('http://localhost:5003');

    useEffect(() => {
        socket.emit('joinRoom', id);
      
        socket.on('role', (role: string) => setRole(role));
        socket.on('codeUpdate', (updatedCode: string) => setCode(updatedCode));
        socket.on('studentCount', (count: number) => setStudentCount(count));
        socket.on('mentorLeft', () => {
          window.location.href = '/codeblocks'; //redirect to lobby if mentor leaves
        });

        return () => {
            socket.disconnect();
          };

    });

    const handleCodeChange = (updatedCode : string) => {
        setCode(updatedCode);
        socket.emit('codeUpdate', id, updatedCode);
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
            />
    
          {isSolutionCorrect && <div style={{ fontSize: '50px' }}>😊</div>}
        </div>
    );

};

export default CodeBlockPage;

      


