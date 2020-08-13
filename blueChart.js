import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/D3';


export default class BlueChart extends LightningElement {
    @track error;
    @track successMessage = '';
    svgWidth = 800;
    svgHeight = 800;

    d3Initialized = false;

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;

        Promise.all([
            loadScript(this, D3)
        ])
            .then(() => {
                this.error = undefined;
                // this.showSuccessMessage();
                this.initializeD3();

            })
            .catch((error) => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading D3',
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }
    showSuccessMessage() {
        alert('Scripts are loaded successfully.');
    }


    initializeD3() {
        // treeData
        const treeData = {
            "name": "Harry",
            "title": "Employer",
            "email": "email@test.com",
            "value": 15,
            "children": [
              {
                "name": "Ron",
                "title": "Employer",
                "email": "email@test.com",
                "value": 10
              },
              {
                "name": "Albus",
                "title": "Employer",
                "email": "email@test.com",
                "value": 10,
                "children": [
                  {
                    "name": "Jack",
                    "title": "Employer",
                    "email": "email@test.com",
                    "value": 7.5
                  },
                  {
                    "name": "Hermione",
                    "title": "Employer",
                    "email": "email@test.com",
                    "value": 7.5
                  }
                ]
              },
              {
                "name": "Jack",
                "title": "Employer",
                "email": "email@test.com",
                "value": 10,
                "children": [
                  {
                    "name": "Jack's kid 1",
                    "title": "Employer",
                    "email": "email@test.com",
                    "value": 7.5
                  },
                  {
                    "name": "Jack's kid 2",
                    "title": "Employer",
                    "email": "email@test.com",
                    "value": 7.5
                  }
                ]
              },
              {
                "name": "Alex",
                "title": "Employer",
                "email": "email@test.com",
                "value": 10,
                "children": [
                  {
                    "name": "Roger",
                    "title": "Employer",
                    "email": "email@test.com",
                    "value": 7.5,
                    "children": [
                      {
                        "name": "Roger's kid",
                        "title": "Employer",
                        "email": "email@test.com",
                        "value": 7.5
                      }
                    ]
                  }
                ]
              },
              {
                "name": "Daniel",
                "title": "Employer",
                "email": "email@test.com",
                "value": 10
              },
              {
                "name": "Daniel 2",
                "title": "Employer",
                "email": "email@test.com",
                "value": 10
              }
            ]
          };

        // set the dimensions and margins of the diagram
        const svg = d3.select(this.template.querySelector('svg.d3')),
              margin = {top: 50, right: 90, bottom: 30, left: 90},
              width = 800 - margin.left - margin.right,
              height =  800 - margin.top - margin.bottom;

        const simulation = d3
        .forceSimulation()
        .force(
            'link',
            d3.forceLink().id((d) => {
                return d.id;
            })
        )
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));

        // declares a tree layout and assigns the size
        const treemap = d3.tree().size([height, width]);

        //  assigns the data to a hierarchy using parent-child relationships
        let nodes = d3.hierarchy(treeData, d => d.children);

        // maps the node data to the tree layout
        nodes = treemap(nodes);

        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        const g = svg.append("g")
            .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        // adds the links between the nodes
        const link = g.selectAll(".link")
            .data( nodes.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .style("stroke", "#1798c1")
            .attr("d", d => {
              return "M" + d.y + "," + d.x
                 + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                 + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                 + " " + d.parent.y + "," + d.parent.x;
                });
        
        // adds each node as a group
        const node = g.selectAll(".node")
            .data(nodes.descendants())
            .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
            .attr("transform", d => "translate("  + d.y + "," + d.x + ")");
        
        // adds the rectangle to the node
        node.append("rect")
          .attr("width", 150)
          .attr("height", 55)
          .attr("x", -75)
          .attr("y", -25)
          .style("stroke", "darkGrey")
          .attr("id", function(d) {
          return d.id;
        })
          .attr("fill", function (d) { return (d.children || d._children || d.hasChild) ? "lightGrey" : "lightGrey"; })
          .style("cursor", function (d) { return (d.children || d._children || d.hasChild) ? "pointer" : "default"; })
          .attr("class", "box");
          
        // adds the text to the node
        node.append("text")
          .attr("dy", "-0.45em")
          .attr("x", - 70)
          .text(d => d.data.name);  

        node.append("text")
          .attr("dy", "0.45em")
          .attr("x", - 70)
          .text(d => d.data.title);  

        node.append("text")
          .attr("dy", "1.45em")
          .attr("x", - 70)
          .text(d => d.data.email);  

        node.append("svg:defs")
          .append("svg:filter")
          .attr("id", "black").attr("height", "150%").attr("width", "150%")
          .append("svg:feOffset")
          .attr("dx", "2").attr("dy", "2").attr("result", "offOut")
          .append("svg:feGaussianBlur")
          .attr("in", "offOut").attr("result", "blurOut").attr("stdDeviation", "200")     // stdDeviation is how much to blur
          .append("svg:feBlend")
          .attr("in", "SourceGraphic").attr("in2", "blurOut").attr("mode", "normal");
   }
}