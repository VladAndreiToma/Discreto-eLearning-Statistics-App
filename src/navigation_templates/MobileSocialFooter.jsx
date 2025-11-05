import { FaDiscord, FaInstagram, FaReddit, FaTiktok, FaYoutube } from "react-icons/fa";

export default function MobileSocialFooter(){
    return(
        <div style={{display:"flex", width:'100%', gap:'1rem', height:'auto', flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                    <div style={{width:'50%', height:'2rem', display:"flex", flexDirection:"row", gap:'1.5rem', justifyContent:"center", alignItems:"center"}}>
                        <FaInstagram style={{height:'100%', width:'100%', cursor:"pointer"}}/>
                        <FaYoutube style={{width:'100%', height:'100%', cursor:"pointer"}}/>
                        <FaTiktok style={{width:'100%', height:'100%', cursor:"pointer"}}/>
                        <FaReddit style={{width:'100%', height:'100%', cursor:"pointer"}}/>
                        <FaDiscord style={{width:'100%', height:'100%', cursor:"pointer"}}/>
                    </div>
        </div>
    )
}