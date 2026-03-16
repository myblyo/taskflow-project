# Experimentos con Inteligencia Artificial

## Introducción

Este documento describe una serie de experimentos realizados para evaluar cómo la inteligencia artificial puede ayudar en tareas de programación.

El objetivo es comparar el proceso de resolución de problemas **con y sin asistencia de IA** para analizar su impacto en el desarrollo de software.

## Metodología


1. Seleccionar tres problemas de programación de la plataforma LeetCode.
2. Resolver cada uno de los problemas **sin utilizar herramientas de inteligencia artificial**, únicamente con los conocimientos propios y recursos tradicionales.
3. Resolver los mismos problemas **utilizando asistencia de una herramienta de inteligencia artificial**.
4. Comparar los resultados obtenidos en ambos casos, teniendo en cuenta aspectos como el **tiempo invertido**, la **calidad del código** y el **nivel de comprensión del problema**.
5. Analizar las diferencias observadas para evaluar el impacto que puede tener el uso de inteligencia artificial en la resolución de problemas de programación.


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

<details>
<summary>Sin IA</summary>

**Solución**

    class Solution {
        public int[] plusOne(int[] digits) {
            for(int i = digits.length - 1; i >= 0; i--) {
                if(digits[i] != 9) {
                    digits[i] += 1;
                    return digits;
                }
                digits[i] = 0;
            }   
            digits = new int[digits.length + 1];
            digits[0] = 1;
            return digits;
        }zzzzzz
    }

--- 

**Respuesta**

    Input
    digits =
    [1,2,5]
    Output
    [1,2,6]
    Expected
    [1,2,6]

</details>


<details>
<summary>Con IA</summary>

**Solución**

    class Solution {
        public int[] plusOne(int[] digits) {
            
            for (int i = digits.length - 1; i >= 0; i--) {
                
                if (digits[i] < 9) {
                    digits[i]++;
                    return digits;
                }
                
                digits[i] = 0;
            }

            int[] result = new int[digits.length + 1];
            result[0] = 1;
            
            return result;
        }
    }
---

**Respuesta**

    Input
    digits =
    [1,2,3]
    Output
    [1,2,4]
    Expected
    [1,2,4]

</details>

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

<details>
<summary>Sin IA</summary>

**Solución**

    class Solution {
        public int reverse(int x) {
            return solution(x, 0);
        }

        public int solution(int x, int rev) {
            if (x == 0) return rev;
            if (rev > Integer.MAX_VALUE / 10 || rev < Integer.MIN_VALUE / 10) return 0;

            int rem = x % 10;
            x = x / 10;
            rev = rev * 10 + rem;

            return solution(x, rev);
        }
    }

--- 

**Respuesta**

    Input
    x =
    123
    Output
    321
    Expected
    321
</details>


<details>
<summary>Con IA</summary>

**Solución**

    class Solution {
        public int reverse(int x) {
            int rev = 0;

            while (x != 0) {
                int digit = x % 10;
                x /= 10;

                // Check overflow before multiplying by 10
                if (rev > Integer.MAX_VALUE / 10 || rev < Integer.MIN_VALUE / 10) {
                    return 0;
                }

                rev = rev * 10 + digit;
            }

            return rev;
        }
    }
---

**Respuesta**

    Input
    x =
    123
    Output
    321
    Expected
    321

</details>

### 3. Basic Calculator II (227. Meium, Math, string, stack)

Given a string s which represents an expression, evaluate this expression and return its value. 
The integer division should truncate toward zero.
You may assume that the given expression is always valid. All intermediate results will be in the range of [-231, 231 - 1].

Note: You are not allowed to use any built-in function which evaluates strings as mathematical expressions, such as eval().

 

Example 1:

    Input: s = "3+2*2"
    Output: 7

Example 2:

    Input: s = " 3/2 "
    Output: 1

Example 3:

    Input: s = " 3+5 / 2 "
    Output: 5
 

Constraints:

* 1 <= s.length <= 3 * 105
* s consists of integers and operators ('+', '-', '*', '/') separated by some number of spaces.
* s represents a valid expression.
* All the integers in the expression are non-negative integers in the range [0, 231 - 1].
* The answer is guaranteed to fit in a 32-bit integer.
<details>
<summary>Sin IA</summary>

**Solución** 
 
    class Solution {
        public int calculate(String s) {

            int num = 0;
            int result = 0;
            int lastNum = 0;
            char sign = '+';

            for (int i = 0; i < s.length(); i++) {
                char ch = s.charAt(i);

            if(Character.isDigit(ch)) {
                    num = num * 10 + (ch - '0');
                }
                if ((!Character.isDigit(ch) && ch != ' ') || i == s.length() - 1) {

                    if (sign == '+') {
                        result += lastNum;
                        lastNum = num;
                    } 
                    else if (sign == '-') {
                        result += lastNum;
                        lastNum = -num;
                    } 
                    else if (sign == '*') {
                        lastNum = lastNum * num;
                    } 
                    else if (sign == '/') {
                        lastNum = lastNum / num;
                    }

                    sign = ch;
                    num = 0;
                }
            }
            System.gc();
            return result + lastNum;
        }
    }

---

**Respuesta**



</details>


<details>
<summary>Con IA</summary>

**Solución** 
    import java.util.*;

    class Solution {
        public int calculate(String s) {
            Stack<Integer> stack = new Stack<>();
            int num = 0;
            char sign = '+';

            for (int i = 0; i < s.length(); i++) {
                char c = s.charAt(i);

                if (Character.isDigit(c)) {
                    num = num * 10 + (c - '0');
                }

                if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {

                    if (sign == '+') {
                        stack.push(num);
                    }
                    else if (sign == '-') {
                        stack.push(-num);
                    }
                    else if (sign == '*') {
                        stack.push(stack.pop() * num);
                    }
                    else if (sign == '/') {
                        stack.push(stack.pop() / num);
                    }

                    sign = c;
                    num = 0;
                }
            }

            int result = 0;
            for (int n : stack) {
                result += n;
            }

            return result;
        }
    }
---

**Respuesta** 

    Input
    s =
    "3+2*2"
    Output
    7
    Expected
    7

</details>


## Conclusión

Comparando el tiempo invertido, la calidad del código y la comprensión del problema, se puede observar que la IA suele tardar menos tiempo que las personas en generar una solución. Sin embargo, la calidad del código y la comprensión del problema dependen en gran medida de la persona y de su nivel de conocimiento y experiencia en programación.


