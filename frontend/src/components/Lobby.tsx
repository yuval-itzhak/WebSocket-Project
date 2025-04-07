import React, {useState, useEffect} from "react";
import {Link} from 'react-router-dom';

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState<any[]>([]);

    useEffect(()=> {
        fetch('http://localhost:5003/api/codeBlocks')
        .then((res) => res.json())
        .then((data) => setCodeBlocks(data));
    }, []);

    return(
        <div>
            <h1>Choose Code Block</h1>
            <ul>
                {codeBlocks.map((block) => (
                    <li key={block._id}>
                        <Link to={`/codeblocks/${block._id}`}>{block.name}</Link>
                    </li>
                ))}
            </ul>

        </div>
    );

};

export default Lobby;