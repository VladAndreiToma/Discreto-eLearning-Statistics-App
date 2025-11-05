export default function LiveParticleCellBG(){
    const cells = Array.from({ length: 300 });
    return(
        <div>
            <div className="particles"></div>
            <div className="cells">
                {cells.map((_, i) => <div key={i}></div>)}
            </div>
        </div>
    )
}