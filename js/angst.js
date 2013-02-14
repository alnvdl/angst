// Return the default disciplines
function get_data()
{
    return [
            {name: "Laboratório de Sistemas Operacionais",
             expr: "Exercícios Individuais(E1, E2, E3, E4):5; Exercício em grupo(EG):5;"},

            {name: "Empreendendorismo e Inovação em TI",
             expr: "Entregas(AI, AN, EP, SE, PNI, PNF)"},

            {name: "Processamento de Imagens",
             expr: "Provas(P1:2, P2:3):5; Trabalhos(T1, T2):3; Projeto(P):2;"},

            {name: "Estruturas de Dados 2",
             expr: "Provas(P1, P2):6; Trabalhos(T1, T2, T3); Listas de Exercícios(L):1"},

            {name: "Engenharia de Software 1",
             expr: "Provas(P1, P2):6; Projeto(Fase 1:0.75, Fase 2:0.75, Fase 3:0.75, Fase 4:0.75, Projeto:2.1, Apresentação:2.8, Implementação:2.1):3; Seminário(Documento, Apresentação):1"},

            {name: "Sistemas Operacionais",
             expr: "Provas(P1, P2):7; Testes(E1, E2, E3, E4):3;"},

            {name: "Banco de Dados",
             expr: "Provas(P1, P2:2, P3:2):7; Trabalhos(TI:2, T1, T2, ..., Tn):3"},

            {name: "Teoria da Computação",
             expr: "Provas(P1, P2)"},

            {name: "Cálculo II",
             expr: "Provas(P1, P2, P3)"},
         ];
}

// Load the disciplines data into the select element
function load_subject_selector()
{
    var data = get_data();
    var select = document.getElementById("angst-subjects");
    
    default_option = document.createElement("option");
    default_option.value = "";
    default_option.appendChild(document.createTextNode("Selecione uma disciplina"));
    select.appendChild(default_option);
    for (var j = 0; j < data.length; j++)
    {
        var discipline = data[j];
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(discipline.name));
        option.value = discipline.expr;
        select.appendChild(option);
    }

    $("#angst-subjects").selectmenu("refresh");
}

// Stuff to do when the document is ready
$(document).ready(function()
{
    // Toggle the help text
    $("#angst-help").click(function()
    { 
        var help = $("#angst-help-content");
        if (help.css("display") == "none")
            help.css("display", "block");
        else
            help.css("display", "none");
    });

    // Updated the context when return is pressed in the text input or using a
    // timeout if other keys are pressed
    $("#angst-expression").attr("timeout", null)
    $("#angst-expression").keypress(function(e)
    {
        if (e.which == 13)
            load($("#angst-expression").val());
        else
        {
            var timeout = $("#angst-expression").attr("timeout")
            if (timeout != null)
                 clearTimeout(timeout);
            timeout = setTimeout("load($('#angst-expression').val());",500);
            $("#angst-expression").attr("timeout", timeout)
        }
    });

    // Set the subject selector
    load_subject_selector();
    $("#angst-subjects").bind("change", function(event, ui)
    {
        load($(this).val());
    });

    // Load nothing
    load();
});

//
// Component
//
function Component(id, weight)
{
    this.name = id;
    this.id = id.replace(" ", "");
    this.input_id = "angst-" + this.id + "-text";
    this.slider_id = "angst-" + this.id + "-slider";
    this.weight = weight;
    
    // Get the weighted value for the component
    this.get_value = function()
    {
        var value = parseFloat($("#" + this.slider_id).val());
        return this.weight * value;
    }

    // Create the component field in HTML
    this.create_fields = function()
    {
        var html = ["<div id='", this.id, "' class='angst-component'>",
                    "<label class='angst-nlabel' for='", this.input_id, "'>",
                    this.name, ": </label><input type='range'",
                    "min='0.0' max='10.0' step='0.1' value='6.0' data-highlight='true'",
                    " id='", this.slider_id, "' class='angst-nslider' data-mini='true' /></div>"];
                    
        return html.join("");
    }
}

//
// Block
//
function Block(id, weight, components)
{
    this.name = id;
    this.id = id.replace(" ", "");
    this.components = components;
    this.weight = weight;

    // Get the weighted value for the block
    this.get_value = function()
    {
        var sum = 0.0;
        var weight_sum = 0.0;
        
        for (i = 0; i < this.components.length; i++)
        {
            sum += this.components[i].get_value();
            weight_sum += this.components[i].weight;
        }
        
        return (sum/weight_sum);
    }

    // Create the block field in HTML
    this.create_fields = function()
    {
        var html = ["<div class='angst-block'>", 
                    "<div class='angst-block-header'>",
                    this.name,
                    "</div>",
                    "<div class='angst-block-content'>"];
        
        for (i = 0; i < this.components.length; i++)
        {
            html.push(this.components[i].create_fields());
        }
        html.push("</div></div>");
        
        return html.join("");
    }
}

//
// Grade
//
function Grade(blocks)
{
    this.blocks = blocks;

    // Get the average grade (based on the weights)
    this.get_value = function()
    {
        var i;
        var sum = 0.0;
        var weight_sum = 0.0;
        
        for (i = 0; i < this.blocks.length; i++)
        {
            sum += this.blocks[i].get_value() * this.blocks[i].weight;
            weight_sum += this.blocks[i].weight;
        }
        
        return (sum/weight_sum);
    }
    
    // Create the grade area in HTML
    this.create_fields = function()
    {
        var i;
        var html = [];
        for (i = 0; i < this.blocks.length; i++)
            html.push(this.blocks[i].create_fields());
        return html.join("");
    }
}

//
// Lexer
//
function Lexer(input)
{
    this.token = "";
    this.token_type = null;
    this.input = input;

    this.re = new Object();
    this.re.symbol = /[^\d:();,]/;
    this.re.number = /\d/;
    this.re.separator = /[\.]/;
    this.re.whitespace = /\s/;

    this.tokens = new Object();
    this.tokens.IDENTIFIER = 0;
    this.tokens.COMMA = 2;
    this.tokens.COLON = 3;
    this.tokens.SEMICOLON = 4;
    this.tokens.LEFT_PARENTHESIS = 5;
    this.tokens.RIGHT_PARENTHESIS = 6;

    var chars = new Object();
    chars[":"] = this.tokens.COLON;
    chars["("] = this.tokens.LEFT_PARENTHESIS;
    chars[")"] = this.tokens.RIGHT_PARENTHESIS;
    chars[";"] = this.tokens.SEMICOLON;
    chars[","] = this.tokens.COMMA;

    this.next = function()
    {

        var ch = this.input.content.charAt(this.input.position);

        // Discard all whitespace
        while (this.re.whitespace.test(ch))
            ch = this.nextChar();
        
        if (ch in chars)
        {
            this.token = ch;
            this.token_type = chars[ch];
            ch = this.nextChar();
        }
        else if (this.re.symbol.test(ch))
        {
            this.token = ch;
            ch = this.nextChar();
            while (this.re.symbol.test(ch) || 
                   this.re.number.test(ch))
            {
                this.token += ch;
                ch = this.nextChar();
            }
            this.token_type = this.tokens.IDENTIFIER;
        }
        else if (this.re.number.test(ch))
        {
            var separator_found = false;
            this.token = ch;
            ch = this.nextChar();
            while (this.re.number.test(ch) || 
                  (this.re.separator.test(ch) && !separator_found))
            {
                if (this.re.separator.test(ch))
                {
                    ch = ".";
                    separator_found == true;
                }
                this.token += ch;
                ch = this.nextChar();
            }
            if (this.token.charAt(this.token.length) == ".")
                this.token += "0";
            this.token = parseFloat(this.token);
            this.token_type = this.tokens.NUMBER;
        }
    }

    this.nextChar = function()
    {
        this.input.position++;
        return this.input.content.charAt(this.input.position);
    }

    this.isLastToken = function()
    {
        return this.input.position == this.input.content.length;
    }
    
    this.end = function()
    {
        return (this.input.position >= this.input.content.length);
    }
}

//
// Parser
//
function Parser(input)
{
    this.lexer = new Lexer(input);
    
    this.count = 0;
    this.error = function(msg, where)
    {
        if (this.count < 3)
        {
            document.write(msg + " " + where + "<br/>");
            this.count++;
        }
    }

    this.parse_component = function()
    {
        if (this.lexer.token_type != this.lexer.tokens.IDENTIFIER)
            throw "Identificador de componente faltando";
        
        var component = new Component(this.lexer.token, 1); 
        this.lexer.next();
        if (this.lexer.token_type == this.lexer.tokens.COLON)
        {
            this.lexer.next();
            if (this.lexer.token_type != this.lexer.tokens.NUMBER)
                throw "O peso de um componente deve ser um número";
            component.weight = this.lexer.token;
            this.lexer.next();
        }
        return component;
    }

    this.parse_block = function()
    {
        if (this.lexer.token_type != this.lexer.tokens.IDENTIFIER)
            throw "Identificador de bloco faltando";
       
        var block = new Block(this.lexer.token, 1, new Array());

        this.lexer.next();
        if (this.lexer.token_type != this.lexer.tokens.LEFT_PARENTHESIS)
            throw "( faltando";
        while (this.lexer.token_type != this.lexer.tokens.RIGHT_PARENTHESIS)
        {

            this.lexer.next();
            block.components.push(this.parse_component());
            if (this.lexer.token_type != this.lexer.tokens.COMMA &&
                this.lexer.token_type != this.lexer.tokens.RIGHT_PARENTHESIS)
                throw "Componentes devem ser separados por vírgula";
        }
        
        this.lexer.next();
        if (this.lexer.token_type == this.lexer.tokens.COLON)
        {
            this.lexer.next();
            if (this.lexer.token_type != this.lexer.tokens.NUMBER)
                throw "O peso de um bloco deve ser um número";
            else
            {
                block.weight = this.lexer.token;
                this.lexer.next();
            }
        }

        return block;
    }

    this.parse_grade = function ()
    {
        var grade = new Grade(Array());
        
        this.lexer.next();
        while (!this.lexer.end())
        {
            grade.blocks.push(this.parse_block());
            // Allow anything as the last token so that we don't need the last ;
            if (this.lexer.token_type != this.lexer.tokens.SEMICOLON &&
                !this.lexer.isLastToken())
                throw "Blocos devem ser separados por ponto e vírgula";
            this.lexer.next();
        }
        if (grade.blocks.length == 0)
            throw "Expressão inválida";
        else
            return grade;
    }
}

// Initialize and set the text inputs and their respective sliders
function set_sliders(subject)
{
    $(".angst-nslider").slider();
    $(".angst-nslider").bind("change", function(event, ui) {
        update_result(subject);
    });
}

// Update the grade and show it in a pretty way
function update_result(subject)
{
    var grade = subject.get_value();
    if (!isNaN(grade))
    {
        if (grade < 5)
            class_ = "angst-red";
        else if (grade >= 5 && grade < 6)
            class_ = "angst-yellow";
        else
            class_ = "angst-green";
        $("#angst-grade").attr("class", class_).html(grade.toFixed(2));
    }
}

// Load the fields
function load(expression)
{
    if (expression == null || expression == undefined || expression == "")
    {
        clear(true, true, true);
        return;
    }

    $("#angst-expression").val(expression);
    var parser = new Parser({"content": expression, "position": 0});
    var grade;
    try
    {
        var grade = parser.parse_grade();
    }
    catch (error)
    {
        show_error(error);
    }

    if (grade != undefined)
    {
        show_grade(grade);
        set_sliders(grade);
        update_result(grade);
    }
}

function clear(input, main, error)
{
    if (input)
        $("#angst-expression").val("");
    if (main)
    {
        $("#angst-controls").css("display", "none");
        $("#angst-controls").empty();
        $("#angst-grade").attr("class", "").html("-");
    }
    if (error)
        $("#angst-error-msg").css("display", "none");
}

function show_grade(grade)
{
    $("#angst-controls").html(grade.create_fields()).trigger("create");
    $("#angst-error-msg").css("display", "none");
    $("#angst-controls").css("display", "block");
}

function show_error(error)
{
    clear(false, true, false);
    $("#angst-error-msg").css("display", "block").html(error);
}

function pos() {
    var height = $("#angst-header").height() * 1.10;
    $("#angst-controls").css("top", height);
    $("#angst-header").width($("#angst").width());
    window.onresize = function(){ pos(); };
}
