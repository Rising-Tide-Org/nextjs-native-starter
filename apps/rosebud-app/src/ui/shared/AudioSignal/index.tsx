import React from 'react'

const AudioSignal = ({ isSilent }: { isSilent: boolean }) => {
  return (
    <div className={`signal-container ${isSilent ? 'no-signal' : ''}`}>
      <div className='signal-bar bar1'></div>
      <div className='signal-bar bar2'></div>
      <div className='signal-bar bar3'></div>
      <div className='signal-bar bar4'></div>
      <div className='signal-bar bar5'></div>
    </div>
  )
}

export default AudioSignal
