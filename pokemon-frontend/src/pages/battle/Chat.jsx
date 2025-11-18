import React, { useEffect, useRef } from 'react'

const Chat = ({ messages, user }) => {
    const ref = useRef()
    useEffect(() => {
        // scroll to bottom on new messages
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
    }, [messages])

    return (
        <div ref={ref} className='flex flex-col gap-3 p-2 overflow-y-auto max-h-96'>
            {
                messages.map((x, ind) => {
                    const mine = x.user === user
                    return (
                        <div key={ind} className={`max-w-[85%]  ${mine ? 'self-end text-right' : 'self-start text-left'}`}>
                            <div className={`inline-block px-3 py-2 rounded-lg  text-start text-sm ${mine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
                                <div className='font-semibold text-xs opacity-90'>{x.user}</div>
                                <div className='mt-1'>{x.message} &nbsp;</div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Chat
