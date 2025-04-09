import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import {io} from 'socket.io-client';
import { javascript } from "@codemirror/lang-javascript";
import { autocompletion } from '@codemirror/autocomplete';
import  CodeMirror  from '@uiw/react-codemirror';
import { useDebouncedCallback } from 'use-debounce';
import { Box, Typography, Button } from '@mui/material';


const CodeBlockPage = () => {
    const { roomId } = useParams<{roomId:string}>();
    const [code, setCode] = useState('');
    const [role, setRole] = useState<string>('student');
    const [solution, setSolution] = useState<string>('');
    const [studentCount, setStudentCount] = useState<number>(0);
    const [codeBlock, setCodeBlock] = useState<any>();
    const [isLoading, setLoading] = useState(true);
    const [showPanel, setShowPanel] = useState(false);
    const [isSolutionCorrect, setIsSolutionCorrect] = useState(false);
    const socketRef = useRef<any>(null);

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
      socketRef.current.on('solutionCheckResult', (result: any) => setIsSolutionCorrect(result));
      socketRef.current.on('mentorLeft', () => {
        window.location.href = '/'; //redirect to lobby if mentor leaves
      });

      return () => {
          socketRef.current.disconnect();
      };

    }, []);

    //wait until the user pauses for 400ms, then send the latest update
    const emitCodeUpdate = useDebouncedCallback((updatedCode: string) => {
        socketRef.current?.emit('codeUpdate', roomId, updatedCode);
      }, 400); // wait 400 ms between after last key

    //function for back to lobby button
    const handleClick = () => {
      window.location.href = '/';
    };

    //panel for display the solution
    const togglePanel = () => {
      setShowPanel((prev) => !prev);
    };

    const codeBlockName = codeBlock ? codeBlock.name : '';
    const codeBlockDesc = codeBlock ? codeBlock.description : '';
      
    if (isLoading) {
      return <p>Loading...</p>; 
    }
    
      return (
        <Box sx={{ p: 3, position: 'relative' }}>

          <Box display="flex" justifyContent="left" alignItems="center" sx={{ mb: 2}} >
            <Button variant='outlined' color='primary' size='small' onClick={handleClick}>
              Back to Lobby
            </Button>
          </Box>

          <Typography variant="h4" gutterBottom>
            Code Block: {codeBlockName}
          </Typography>
          <Typography variant="body1" paragraph>
            {codeBlockDesc}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Role: {role}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Students in Room: {studentCount}
          </Typography>

          <Button variant="outlined" sx={{ mb: 2, mt: 2 }} size='small' onClick={togglePanel}>
            Click to see the solution
          </Button>

          {/* for display the solution */}
          {showPanel && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                mt: 2,
                mb: 2,
                border: '1px solid #ccc',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">solution</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {solution}
              </Typography>
            </Box>
          )}

         {isSolutionCorrect && !isLoading && <div style={{ fontSize: '50px' }}>😊 Good Job!</div>}

          {/* for the code editor */}
          <CodeMirror
            value={code}
            height="300px"
            extensions={[javascript(), autocompletion()]}
            editable={role !== 'mentor'}
            onChange={(value) => {
              setCode(value);
              emitCodeUpdate(value);}}/>
      </Box>
  );   
};

export default CodeBlockPage;

