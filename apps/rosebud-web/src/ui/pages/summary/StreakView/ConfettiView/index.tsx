import { useCallback } from 'react'
import type { Engine } from 'tsparticles-engine'
import Particles from 'react-particles'
import { loadFull } from 'tsparticles' // if you are going to use `loadFull`, install the "tsparticles" package too.
import { useTheme } from '@chakra-ui/react'
// import { loadSlim } from 'tsparticles-slim' // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.

const ConfettiView = () => {
  const { colors } = useTheme()
  const particlesInit = useCallback(async (engine: Engine) => {
    // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    //await loadFull(engine);
    await loadFull(engine)
  }, [])

  return (
    <Particles
      id='tsparticles'
      init={particlesInit}
      height='100%'
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
      }}
      options={{
        fullScreen: { enable: false },
        fpsLimit: 120,
        preset: 'confetti',
        emitters: {
          startCount: 1, // Start with one emitter
          position: {
            x: 50, // Central position (based on percentages, so 50 is in the middle)
            y: 20,
          },
          rate: {
            quantity: 20, // Number of particles in the burst
            delay: 0.1, // Emit particles once in this delay
          },
          life: {
            duration: 0.2, // Duration of the emitter
            count: 1, // Emit once
          },
        },

        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push',
            },
          },
          modes: {
            push: {
              quantity: 5,
            },
          },
        },

        particles: {
          color: {
            value: [
              colors.brand[500],
              colors.brand[600],
              colors.brandGray[700],
            ],
          },
          move: {
            decay: 0.05,
            direction: 'top',
            enable: true,
            speed: {
              min: 30,
              max: 40,
            },
            outModes: {
              top: 'none',
              default: 'destroy',
            },
          },
          number: {
            value: 0, // No continuously emitting particles
          },
          opacity: {
            value: 1,
          },
          shape: {
            type: 'star',
          },
          rotate: {
            value: {
              min: 0,
              max: 180,
            },
            direction: 'random',
            animation: {
              enable: true,
              speed: 60,
            },
          },
          gravity: {
            enable: true,
          },
          size: {
            value: 8,
          },
          tilt: {
            direction: 'random',
            enable: true,
            value: {
              min: 0,
              max: 180,
            },
            animation: {
              enable: true,
              speed: 30,
            },
          },
          roll: {
            darken: {
              enable: true,
              value: 25,
            },
            enable: true,
            speed: {
              min: 5,
              max: 15,
            },
          },
          wobble: {
            distance: 30,
            enable: true,
            speed: {
              min: -15,
              max: 15,
            },
          },
          zIndex: {
            value: {
              min: 0,
              max: 100,
            },
          },
        },
        detectRetina: true,
      }}
    />
  )
}

export default ConfettiView
