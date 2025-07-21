import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { BASE_URL } from "../../api/baseUrl";

export default function MyLikeList() {
    const { loginToken } = useContext(AuthContext);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BASE_URL}:8888/myPage/myLikes`, {
            headers: { Authorization: `Bearer ${loginToken}` }
        })
        .then(res => res.json())
        .then(setLikes)
        .finally(() => setLoading(false));
    }, [loginToken]);

    if (loading) return <div>불러오는 중...</div>;
    if (!likes.length) return <div>좋아요한 글이 없습니다.</div>;

    return (
        <div>
            <h3>좋아요한 글</h3>
            <ul>
                {likes.map(post => (
                    <li key={post.id}>
                        {post.title}
                        <span style={{color:"#888"}}> ({post.createdAt?.slice(0, 10)})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
