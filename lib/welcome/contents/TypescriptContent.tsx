import React from 'react'
import ContentStep from '../ContentStep'
import AsterikIcon from '../icons/AsterikIcon'

const TypescriptContent = () => {
  return (
    <div>
      <h2>TypeScript</h2>
      <p>A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.</p>
      <p>
        TypeScript adds additional syntax to JavaScript to support a tighter integration with your editor, providing you
        with better code completion, navigation, and refactoring.
      </p>

      <div className="welcome-content-steps">
        <ContentStep
          title="Type System"
          description="Static type checking to catch errors during development"
          icon={AsterikIcon}
        />

        <ContentStep
          title="IDE Support"
          description="Rich intellisense, code navigation, and refactoring tools"
          icon={AsterikIcon}
        />

        <ContentStep
          title="JavaScript Compatibility"
          description="Works with existing JavaScript code and gradually adopts new features"
          icon={AsterikIcon}
        />

        <ContentStep
          title="Modern Features"
          description="Access to the latest ECMAScript features with backward compatibility"
          icon={AsterikIcon}
        />
      </div>

      <p className="learn-more">
        Learn more about TypeScript at{' '}
        <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">
          typescriptlang.org
        </a>
      </p>
    </div>
  )
}

export default TypescriptContent
