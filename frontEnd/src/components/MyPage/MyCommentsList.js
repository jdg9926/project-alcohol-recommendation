import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { BASE_URL } from "../../api/baseUrl";

export default function MyCommentsList() {
    const { loginToken } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BASE_URL}:8888/myPage/myComments`, {
            headers: { Authorization: `Bearer ${loginToken}` }
        })
        .then(res => res.json())
        .then(setComments)
        .finally(() => setLoading(false));
    }, [loginToken]);

    if (loading) return <div>불러오는 중...</div>;
    if (!comments.length) return <div>내가 쓴 댓글이 없습니다.</div>;

    return (
        <div>
            <h3>내가 쓴 댓글</h3>
            <ul>
                {comments.map(comment => (
                    <li key={comment.id}>
                        <span style={{fontWeight:600}}>{comment.content}</span>
                        <span style={{color:"#888"}}> ({comment.boardTitle} / {comment.createdAt?.slice(0, 10)})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
