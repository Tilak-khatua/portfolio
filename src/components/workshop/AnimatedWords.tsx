import { Fragment } from 'react'

export default function AnimatedWords({ text }: { text: string }) {
  const words = text.split(' ')
  return <>{words.map((word, index) => <Fragment key={`${index}-${word}`}><span className="motion-word" aria-hidden="true"><span data-word>{word}</span></span>{index < words.length - 1 ? ' ' : null}</Fragment>)}</>
}
