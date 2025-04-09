import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Stack,
} from "@mui/material";


const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  

  useEffect(() => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;

    fetch(`${apiUrl}/api/codeBlocks`)
      .then((res) => res.json())
      .then((data) => {
        setCodeBlocks(data);
        setLoading(false);
      });

  }, []);

  if (isLoading) {
    return <p>Loading...</p>; 
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Choose a Code Block
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
        {codeBlocks.map((block) => (
          <Box key={block._id} width={{ xs: "100%", sm: "45%", md: "30%" }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
                {/* creating the code block url */}
                <CardActionArea component={Link} to={`/codeblocks/${block._id}`} sx={{ height: "100%" }}>
                    <CardContent>
                        <Typography variant="h6" component="div" gutterBottom>
                        {block.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        {block.description || "No description available."}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default Lobby;
