import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import {io} from 'socket.io-client';
import { javascript } from "@codemirror/lang-javascript";
import { autocompletion } from '@codemirror/autocomplete';
import  CodeMirror  from '@uiw/react-codemirror';
import debounce from 'lodash.debounce';
import { Box, Typography } from '@mui/material';


const CodeBlockPage = () => {
    const { room_id } = useParams<{room_id:string}>();
    const [code, setCode] = useState('');
    const [role, setRole] = useState<string>('student');
    const [solution, setSolution] = useState<string>('n');
    const [studentCount, setStudentCount] = useState<number>(0);
    const socketRef = useRef<any>(null);
    const [codeBlocks, setCodeBlocks] = useState<any[]>([]);

    useEffect(() => { 
      const apiUrl = process.env.REACT_APP_API_URL;

        socketRef.current = io(`${apiUrl}`);

        fetch(`${apiUrl}/api/codeBlocks`)
        .then((res) => res.json())
        .then((data) => setCodeBlocks(data));

        socketRef.current.emit('joinRoom', room_id);  
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

    const emitCodeUpdate = debounce((updatedCode: string) => {
        socketRef.current?.emit('codeUpdate', room_id, updatedCode);
      }, 700); // wait 700 ms between after last key

      const roomCodeBlock = codeBlocks.find((block: any) => block._id === room_id);
      const codeBlockName = roomCodeBlock ? roomCodeBlock.name : '';
      const codeBlockDesc = roomCodeBlock ? roomCodeBlock.description : '';
      //const solution = roomCodeBlock ? roomCodeBlock.solution : '';
      const isSolutionCorrect = code === solution;      
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

         {isSolutionCorrect && <div style={{ fontSize: '50px' }}>😊</div>}

      </Box>
  );   
};

export default CodeBlockPage;

