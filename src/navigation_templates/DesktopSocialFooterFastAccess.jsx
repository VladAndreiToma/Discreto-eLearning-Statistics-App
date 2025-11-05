import { FaDiscord, FaInstagram, FaReddit, FaTiktok, FaYoutube } from "react-icons/fa";

export default function SocialFastAccessFooter(){
    return(
        <div style={{display:"flex", width:'100%', gap:'1rem', height:'100%', flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
            <label style={{fontWeight:"bold", fontSize:'1rem'}}>Follow us on social media:</label>
            <div style={{width:'100%', height:'3.8vh', display:"flex", flexDirection:"row", gap:'1rem', justifyContent:"center", alignItems:"center"}}>
                <FaInstagram style={{height:'100%', width:'100%', cursor:"pointer"}}/>
                <FaYoutube style={{width:'100%', height:'100%', cursor:"pointer"}}/>
                <FaTiktok style={{width:'100%', height:'100%', cursor:"pointer"}}/>
                <FaReddit style={{width:'100%', height:'100%', cursor:"pointer"}}/>
                <FaDiscord style={{width:'100%', height:'100%', cursor:"pointer"}}/>
            </div>
        </div>
    )
}