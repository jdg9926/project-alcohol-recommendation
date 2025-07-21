import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { BASE_URL } from "../../api/baseUrl";

export default function MyPostsList() {
    const { loginToken } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BASE_URL}:8888/myPage/myPosts`, {
            headers: { Authorization: `Bearer ${loginToken}` }
        })
        .then(res => res.json())
        .then(setPosts)
        .finally(() => setLoading(false));
    }, [loginToken]);

    if (loading) return <div>불러오는 중...</div>;
    if (!posts.length) return <div>내가 쓴 글이 없습니다.</div>;

    return (
        <div>
            <h3>내가 쓴 글</h3>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        {post.title} <span style={{color:"#888"}}>({post.createdAt?.slice(0, 10)})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
