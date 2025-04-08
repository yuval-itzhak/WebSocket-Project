import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import {io} from 'socket.io-client';
import { javascript } from "@codemirror/lang-javascript";
import { autocompletion } from '@codemirror/autocomplete';
import  CodeMirror  from '@uiw/react-codemirror';
import { useDebouncedCallback } from 'use-debounce';
import { Box, Typography } from '@mui/material';


const CodeBlockPage = () => {
    const { roomId } = useParams<{roomId:string}>();
    const [code, setCode] = useState('');
    const [role, setRole] = useState<string>('student');
    const [solution, setSolution] = useState<string>('');
    const [studentCount, setStudentCount] = useState<number>(0);
    const socketRef = useRef<any>(null);
    const [codeBlock, setCodeBlock] = useState<any>();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => { 
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;

        socketRef.current = io(`${apiUrl}`);

        fetch(`${apiUrl}/api/codeBlocks/${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          setCodeBlock(data)
          setLoading(false);
        });

        socketRef.current.emit('joinRoom', roomId);  
        socketRef.current.on('role', (role: string) => setRole(role));
        socketRef.current.on('codeUpdate', (updatedCode: string) => setCode(updatedCode));
        socketRef.current.on('solution', (solution: string) => setSolution(solution));
        socketRef.current.on('studentCount', (count: number) => setStudentCount(count));
        socketRef.current.on('mentorLeft', () => {
          window.location.href = '/'; //redirect to lobby if mentor leaves
        });

        return () => {
            socketRef.current.disconnect();
          };

    }, []);

    const emitCodeUpdate = useDebouncedCallback((updatedCode: string) => {
        socketRef.current?.emit('codeUpdate', roomId, updatedCode);
        console.log(`im here`);
      }, 400); // wait 400 ms between after last key

      const codeBlockName = codeBlock ? codeBlock.name : '';
      const codeBlockDesc = codeBlock ? codeBlock.description : '';
      const isSolutionCorrect = code === solution && code !== ""; 
      
    if (isLoading) {
      return <p>Loading...</p>; 
    }
    
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Code Block: {codeBlockName}
          </Typography>
          <Typography variant="body1" paragraph>
            {codeBlockDesc}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Role: {role}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Students in Room: {studentCount}
          </Typography>

          <CodeMirror
            value={code}
            height="300px"
            extensions={[javascript(), autocompletion()]}
            editable={role !== 'mentor'}
            onChange={(value) => {
              setCode(value);
              emitCodeUpdate(value);}}/>

         {isSolutionCorrect && !isLoading && <div style={{ fontSize: '50px' }}>😊</div>}

      </Box>
  );   
};

export default CodeBlockPage;

