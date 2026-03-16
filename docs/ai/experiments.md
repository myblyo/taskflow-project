# Experimentos con Inteligencia Artificial

## Introducción

Este documento describe una serie de experimentos realizados para evaluar cómo la inteligencia artificial puede ayudar en tareas de programación.

El objetivo es comparar el proceso de resolución de problemas **con y sin asistencia de IA** para analizar su impacto en el desarrollo de software.

## Metodología

Para cada experimento se seguirá el siguiente proceso:

1. Elegir tres problemas de programación. En este caso utilizaré leetcode.
2. Resolver el problema **sin utilizar herramientas de inteligencia artificial**.
3. Resolver el mismo problema **utilizando asistencia de IA**.
4. Comparar ambos resultados.

## Aspectos analizados

En cada experimento se evaluarán los siguientes factores:

* Tiempo invertido en resolver el problema.
* Calidad del código generado.
* Claridad y comprensión de la solución.

## Códigos que resolver

### 1. Plus one (66 Math Easy)
You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's.

Increment the large integer by one and return the resulting array of digits.

    

Example 1:

        Input: digits = [1,2,3]
        Output: [1,2,4]
        Explanation: The array represents the integer 123.
        Incrementing by one gives 123 + 1 = 124.
        Thus, the result should be [1,2,4].
    
Example 2:

        Input: digits = [4,3,2,1]
        Output: [4,3,2,2]
        Explanation: The array represents the integer 4321.
        Incrementing by one gives 4321 + 1 = 4322.
        Thus, the result should be [4,3,2,2].
    
Example 3:

    Input: digits = [9]
    Output: [1,0]
    Explanation: The array represents the integer 9.
    Incrementing by one gives 9 + 1 = 10.
    Thus, the result should be [1,0].


Constraints:

* 1 <= digits.length <= 100
* 0 <= digits[i] <= 9
* digits does not contain any leading 0's.

### 2. Reverse Integer (7. Math Medium)

Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-231, 231 - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).

 

Example 1:

    Input: x = 123
    Output: 321

Example 2:

    Input: x = -123
    Output: -321

Example 3:

    Input: x = 120
    Output: 21

Constraints:
* -2^31 <= x <= 2^31 - 1

### 3. Basic Calculator (224. Math, string, stack, recursion, Hard)

Given a string s representing a valid expression, implement a basic calculator to evaluate it, and return the result of the evaluation.

Note: You are not allowed to use any built-in function which evaluates strings as mathematical expressions, such as eval().

 

Example 1:

    Input: s = "1 + 1"
    Output: 2

Example 2:

    Input: s = " 2-1 + 2 "
    Output: 3

Example 3:

    Input: s = "(1+(4+5+2)-3)+(6+8)"
    Output: 23
 

Constraints:

* 1 <= s.length <= 3 * 105
* s consists of digits, '+', '-', '(', ')', and ' '.
* s represents a valid expression.
* '+' is not used as a unary operation (i.e., "+1" and "+(2 + 3)" is invalid).
* '-' could be used as a unary operation (i.e., "-1" and "-(2 + 3)" is valid).
* There will be no two consecutive operators in the input.
* Every number and running calculation will fit in a signed 32-bit integer.



