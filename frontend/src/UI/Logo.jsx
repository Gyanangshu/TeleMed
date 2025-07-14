import React from 'react'
import { LuStethoscope } from 'react-icons/lu'

const Logo = ({bgwidth, bgheight, logowidth, logoheight, text}) => {
    return (
        <div className="flex items-center gap-4">
            <div className={`${bgwidth} ${bgheight} bg-gradient-to-br from-medical-600 to-emerald-600 rounded-xl flex items-center justify-center`}>
                <LuStethoscope className={`${logowidth} ${logoheight} text-white`} />
            </div>
            <span className={`${text}`}>TeleMed</span>
        </div>
    )
}

export default Logo
