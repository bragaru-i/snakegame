import React, {useState, useEffect, useRef} from 'react'

import {useFocus, useInterval} from '../hooks'
import {APPLE_START, CANVAS_SIZE, DIRECTIONS, SCALE, SNAKE_START, SPEED} from '../constants'
import s from './SnakeGame.module.scss'


export const SnakeGame = () => {
    const canvasRef = useRef(null)
    const [containerRef, focusContainer] = useFocus()

    const [apple, setApple] = useState(APPLE_START)
    const [snake, setSnake] = useState(SNAKE_START)
    const [dir, setDir] = useState(DIRECTIONS[38])
    const [speed, setSpeed] = useState(null)
    const [isGameOver, setIsGameOver] = useState(true)



    const endGame = () => {
        setSpeed(null);
        setIsGameOver(true);
    };
    const moveSnake = ({keyCode}) => {
        keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);
    }

    const createApple = () =>
        apple.map((_a, i) => i < 2 ? Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)) : `#${Math.floor(Math.random() * 16777215).toString(16)}`);

    const checkCollision = (piece, snk = snake) => {
        if (
            piece[0] * SCALE >= CANVAS_SIZE[0] ||
            piece[0] < 0 ||
            piece[1] * SCALE >= CANVAS_SIZE[1] ||
            piece[1] < 0
        )
            return true;

        for (const segment of snk) {
            if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
        }
        return false;
    };

    const checkAppleCollision = newSnake => {
        if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
            let newApple = createApple();
            while (checkCollision(newApple, newSnake)) {
                newApple = createApple();
            }
            setApple(newApple);
            return true;
        }
        return false;
    };

    const gameLoop = () => {
        const snakeCopy = JSON.parse(JSON.stringify(snake));
        const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1], apple[2]];
        snakeCopy.unshift(newSnakeHead);
        if (checkCollision(newSnakeHead)) endGame();
        if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
        setSnake(snakeCopy);
    };

    const startGame = () => {
        focusContainer()
        setSnake(SNAKE_START);
        setApple(APPLE_START);
        setDir([0, -1]);
        setSpeed(SPEED);
        setIsGameOver(false);
    };



    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        snake.forEach(([x, y, color]) => {
            console.log(x,y,color)
            context.fillStyle = color;
            context.fillRect(x, y, 1, 1)
        });

        context.fillStyle = apple[2];
        context.fillRect(apple[0], apple[1], 1, 1);
    }, [snake, apple, isGameOver]);

    useInterval(() => gameLoop(), speed);
    const startOnKeyDown = ({code}) => {

        if (code === "Space" && isGameOver) {
            startGame()
        }
    }
    useEffect(() => {
        document.addEventListener('keyup', startOnKeyDown)
        return () => document.removeEventListener('keyup', startOnKeyDown)

    })

    return (
        <div
            ref={containerRef}
            className={s.container} role="button" tabIndex="0" onKeyDown={e => moveSnake(e)}>
            <canvas
                style={{border: "1px solid black"}}
                ref={canvasRef}
                width={`${CANVAS_SIZE[0]}px`}
                height={`${CANVAS_SIZE[1]}px`}
            />

            {isGameOver && <button className={s.button} onClick={startGame}>Start Game</button>}
        </div>
    )
}

